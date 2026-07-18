import { CoopStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { getPagination, paginatedResponse, PaginationQuery } from "../utils/pagination";
import { logger } from "../config/logger";

interface CreateCooperativeInput {
  name: string;
  state: string;
  lga?: string;
  address?: string;
  regNumber?: string;
  chairPersonId?: string;
  maxMembers?: number;
  cropFocus?: string;
  savingsPerMemberKobo?: number;
}

interface CooperativeQueryFilters extends PaginationQuery {
  state?: string;
  status?: CoopStatus;
  lenderOrgId?: string;
  search?: string;
  cropFocus?: string;
}

export class CooperativeService {
  static async create(lenderOrgId: string, data: CreateCooperativeInput, createdBy: string) {
    if (data.regNumber) {
      const existing = await prisma.cooperative.findUnique({ where: { regNumber: data.regNumber } });
      if (existing) throw ApiError.conflict("Registration number already exists");
    }

    const coop = await prisma.cooperative.create({
      data: {
        name: data.name,
        state: data.state,
        lga: data.lga,
        address: data.address,
        regNumber: data.regNumber,
        chairPersonId: data.chairPersonId,
        maxMembers: data.maxMembers || 100,
        lenderOrgId,
        status: "ACTIVE",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: createdBy,
        action: "COOPERATIVE_CREATED",
        resource: "COOPERATIVE",
        resourceId: coop.id,
        details: { name: coop.name, state: coop.state },
      },
    });

    logger.info("Cooperative created", { id: coop.id, name: coop.name });

    return coop;
  }

  static async getAll(query: CooperativeQueryFilters) {
    const { page, limit, skip } = getPagination(query);
    const where: Prisma.CooperativeWhereInput = {};

    if (query.state) where.state = query.state;
    if (query.status) where.status = query.status;
    if (query.lenderOrgId) where.lenderOrgId = query.lenderOrgId;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { regNumber: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [cooperatives, total] = await Promise.all([
      prisma.cooperative.findMany({
        where,
        include: {
          _count: { select: { members: true } },
          lenderOrg: { select: { name: true } },
          members: {
            select: { farmScore: true },
            take: 100,
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.cooperative.count({ where }),
    ]);

    const formatted = cooperatives.map((c) => {
      const avgScore = c.members.length > 0
        ? Math.round(c.members.reduce((sum, m) => sum + m.farmScore, 0) / c.members.length)
        : 0;
      const tier = avgScore >= 700 ? "GOLD" : avgScore >= 500 ? "SILVER" : "BRONZE";

      return {
        ...c,
        totalLoans: Number(c.totalLoans),
        groupFarmScore: avgScore,
        groupTier: tier,
        members: undefined,
      };
    });

    return paginatedResponse(formatted, total, page, limit);
  }

  static async getById(id: string) {
    const coop = await prisma.cooperative.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { firstName: true, lastName: true, phone: true, email: true } },
            loans: { where: { status: "ACTIVE" }, select: { id: true, amount: true, status: true } },
          },
          take: 100,
        },
        lenderOrg: { select: { name: true } },
      },
    });
    if (!coop) throw ApiError.notFound("Cooperative not found");

    const avgScore = coop.members.length > 0
      ? Math.round(coop.members.reduce((sum, m) => sum + m.farmScore, 0) / coop.members.length)
      : 0;
    const tier = avgScore >= 700 ? "GOLD" : avgScore >= 500 ? "SILVER" : "BRONZE";

    return {
      ...coop,
      totalLoans: Number(coop.totalLoans),
      groupFarmScore: avgScore,
      groupTier: tier,
    };
  }

  static async update(id: string, data: Partial<{
    name: string;
    state: string;
    lga: string;
    address: string;
    chairPersonId: string;
    maxMembers: number;
    status: CoopStatus;
  }>) {
    const coop = await prisma.cooperative.findUnique({ where: { id } });
    if (!coop) throw ApiError.notFound("Cooperative not found");

    return prisma.cooperative.update({
      where: { id },
      data,
    });
  }

  static async addMember(cooperativeId: string, borrowerId: string, addedBy: string) {
    const coop = await prisma.cooperative.findUnique({ where: { id: cooperativeId } });
    if (!coop) throw ApiError.notFound("Cooperative not found");
    if (coop.status !== "ACTIVE") throw ApiError.badRequest("Cooperative is not active");
    if (coop.memberCount >= coop.maxMembers) throw ApiError.badRequest("Cooperative is at maximum capacity");

    const borrower = await prisma.borrowerProfile.findUnique({
      where: { id: borrowerId },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
    if (!borrower) throw ApiError.notFound("Borrower not found");
    if (borrower.cooperativeId) throw ApiError.conflict("Borrower is already in a cooperative");

    await prisma.$transaction([
      prisma.borrowerProfile.update({
        where: { id: borrowerId },
        data: { cooperativeId },
      }),
      prisma.cooperative.update({
        where: { id: cooperativeId },
        data: { memberCount: { increment: 1 } },
      }),
    ]);

    await prisma.auditLog.create({
      data: {
        userId: addedBy,
        action: "MEMBER_ADDED_TO_COOPERATIVE",
        resource: "COOPERATIVE",
        resourceId: cooperativeId,
        details: {
          borrowerId,
          borrowerName: `${borrower.user.firstName} ${borrower.user.lastName}`,
        },
      },
    });

    logger.info("Member added to cooperative", { cooperativeId, borrowerId });

    return this.getById(cooperativeId);
  }

  static async removeMember(cooperativeId: string, borrowerId: string, removedBy: string, reason?: string) {
    const borrower = await prisma.borrowerProfile.findUnique({
      where: { id: borrowerId },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
    if (!borrower) throw ApiError.notFound("Borrower not found");
    if (borrower.cooperativeId !== cooperativeId) {
      throw ApiError.badRequest("Borrower is not a member of this cooperative");
    }

    await prisma.$transaction([
      prisma.borrowerProfile.update({
        where: { id: borrowerId },
        data: { cooperativeId: null },
      }),
      prisma.cooperative.update({
        where: { id: cooperativeId },
        data: { memberCount: { decrement: 1 } },
      }),
    ]);

    await prisma.auditLog.create({
      data: {
        userId: removedBy,
        action: "MEMBER_REMOVED_FROM_COOPERATIVE",
        resource: "COOPERATIVE",
        resourceId: cooperativeId,
        details: {
          borrowerId,
          borrowerName: `${borrower.user.firstName} ${borrower.user.lastName}`,
          reason,
        },
      },
    });

    logger.info("Member removed from cooperative", { cooperativeId, borrowerId, reason });

    return this.getById(cooperativeId);
  }

  static async getMembers(cooperativeId: string, query: PaginationQuery) {
    const { page, limit, skip } = getPagination(query);

    const coop = await prisma.cooperative.findUnique({ where: { id: cooperativeId } });
    if (!coop) throw ApiError.notFound("Cooperative not found");

    const [members, total] = await Promise.all([
      prisma.borrowerProfile.findMany({
        where: { cooperativeId },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          loans: {
            select: { id: true, amount: true, status: true, amountPaid: true, totalRepayable: true },
            orderBy: { createdAt: "desc" },
          },
          _count: { select: { loans: true } },
        },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
      }),
      prisma.borrowerProfile.count({ where: { cooperativeId } }),
    ]);

    const formatted = members.map((m) => {
      const role = m.id === coop.chairPersonId ? "Chair" : "Member";
      const activeLoan = m.loans.find((l) => l.status === "ACTIVE");

      return {
        ...m,
        role,
        loanStatus: activeLoan ? "Active" : "None",
        totalLoans: m._count.loans,
        loans: m.loans.map((l) => ({
          ...l,
          amount: Number(l.amount),
          amountPaid: Number(l.amountPaid),
          totalRepayable: Number(l.totalRepayable),
        })),
      };
    });

    return paginatedResponse(formatted, total, page, limit);
  }

  static async getLoans(cooperativeId: string, query: PaginationQuery) {
    const { page, limit, skip } = getPagination(query);

    const coop = await prisma.cooperative.findUnique({ where: { id: cooperativeId } });
    if (!coop) throw ApiError.notFound("Cooperative not found");

    const memberIds = await prisma.borrowerProfile.findMany({
      where: { cooperativeId },
      select: { id: true },
    }).then((m) => m.map((b) => b.id));

    const [loans, total] = await Promise.all([
      prisma.borrowerLoan.findMany({
        where: { borrowerId: { in: memberIds } },
        include: {
          borrower: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
          program: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.borrowerLoan.count({ where: { borrowerId: { in: memberIds } } }),
    ]);

    const formatted = loans.map((l) => ({
      ...l,
      amount: Number(l.amount),
      totalRepayable: Number(l.totalRepayable),
      amountPaid: Number(l.amountPaid),
    }));

    return paginatedResponse(formatted, total, page, limit);
  }

  static async getStats(cooperativeId: string) {
    const coop = await prisma.cooperative.findUnique({ where: { id: cooperativeId } });
    if (!coop) throw ApiError.notFound("Cooperative not found");

    const members = await prisma.borrowerProfile.findMany({
      where: { cooperativeId },
      select: { id: true, farmScore: true, farmScoreTier: true },
    });

    const memberIds = members.map((m) => m.id);

    const [totalLoansValue, totalRepaid, activeLoans, completedLoans, defaultedLoans] = await Promise.all([
      prisma.borrowerLoan.aggregate({
        where: { borrowerId: { in: memberIds } },
        _sum: { amount: true },
      }),
      prisma.repayment.aggregate({
        where: { loan: { borrowerId: { in: memberIds } }, status: "PAID" },
        _sum: { paidAmount: true },
      }),
      prisma.borrowerLoan.count({
        where: { borrowerId: { in: memberIds }, status: "ACTIVE" },
      }),
      prisma.borrowerLoan.count({
        where: { borrowerId: { in: memberIds }, status: "COMPLETED" },
      }),
      prisma.borrowerLoan.count({
        where: { borrowerId: { in: memberIds }, status: "DEFAULTED" },
      }),
    ]);

    const totalDisbursed = Number(totalLoansValue._sum.amount || 0);
    const totalRepaidAmount = Number(totalRepaid._sum.paidAmount || 0);
    const repaymentRate = totalDisbursed > 0 ? (totalRepaidAmount / totalDisbursed) * 100 : 0;

    const avgScore = members.length > 0
      ? Math.round(members.reduce((sum, m) => sum + m.farmScore, 0) / members.length)
      : 0;

    const scoreDistribution = {
      EXCELLENT: members.filter((m) => m.farmScoreTier === "EXCELLENT").length,
      GOOD: members.filter((m) => m.farmScoreTier === "GOOD").length,
      FAIR: members.filter((m) => m.farmScoreTier === "FAIR").length,
      POOR: members.filter((m) => m.farmScoreTier === "POOR").length,
    };

    await prisma.cooperative.update({
      where: { id: cooperativeId },
      data: {
        totalLoans: totalDisbursed,
        repaymentRate: Math.round(repaymentRate * 10) / 10,
      },
    });

    return {
      memberCount: coop.memberCount,
      maxMembers: coop.maxMembers,
      groupFarmScore: avgScore,
      groupTier: avgScore >= 700 ? "GOLD" : avgScore >= 500 ? "SILVER" : "BRONZE",
      scoreDistribution,
      totalDisbursed,
      totalRepaid: totalRepaidAmount,
      repaymentRate: Math.round(repaymentRate * 10) / 10,
      activeLoans,
      completedLoans,
      defaultedLoans,
    };
  }

  static async getGroupScore(cooperativeId: string) {
    const coop = await prisma.cooperative.findUnique({ where: { id: cooperativeId } });
    if (!coop) throw ApiError.notFound("Cooperative not found");

    const members = await prisma.borrowerProfile.findMany({
      where: { cooperativeId },
      select: {
        id: true,
        farmScore: true,
        farmScoreTier: true,
        user: { select: { firstName: true, lastName: true } },
      },
    });

    const avgMemberScore = members.length > 0
      ? members.reduce((sum, m) => sum + m.farmScore, 0) / members.length
      : 0;

    const groupScore = Math.round(avgMemberScore * 0.7 + coop.repaymentRate * 0.2 + (coop.memberCount > 10 ? 10 : coop.memberCount) * 0.1 * 10);
    const tier = groupScore >= 700 ? "GOLD" : groupScore >= 500 ? "SILVER" : "BRONZE";

    return {
      groupScore,
      tier,
      formula: {
        avgMemberScore: Math.round(avgMemberScore),
        memberScoreWeight: 70,
        repaymentRate: coop.repaymentRate,
        repaymentWeight: 20,
        reportingConsistency: 10,
        reportingWeight: 10,
      },
      memberScores: members.map((m) => ({
        borrowerId: m.id,
        name: `${m.user.firstName} ${m.user.lastName}`,
        score: m.farmScore,
        tier: m.farmScoreTier,
      })),
    };
  }

  static async suspend(id: string, suspendedBy: string, reason: string) {
    const coop = await prisma.cooperative.findUnique({ where: { id } });
    if (!coop) throw ApiError.notFound("Cooperative not found");

    const updated = await prisma.cooperative.update({
      where: { id },
      data: { status: "SUSPENDED" },
    });

    await prisma.auditLog.create({
      data: {
        userId: suspendedBy,
        action: "COOPERATIVE_SUSPENDED",
        resource: "COOPERATIVE",
        resourceId: id,
        details: { name: coop.name, reason },
      },
    });

    logger.info("Cooperative suspended", { id, reason });

    return updated;
  }

  static async reactivate(id: string, reactivatedBy: string) {
    const coop = await prisma.cooperative.findUnique({ where: { id } });
    if (!coop) throw ApiError.notFound("Cooperative not found");

    const updated = await prisma.cooperative.update({
      where: { id },
      data: { status: "ACTIVE" },
    });

    await prisma.auditLog.create({
      data: {
        userId: reactivatedBy,
        action: "COOPERATIVE_REACTIVATED",
        resource: "COOPERATIVE",
        resourceId: id,
        details: { name: coop.name },
      },
    });

    logger.info("Cooperative reactivated", { id });

    return updated;
  }

  static async dissolve(id: string, dissolvedBy: string, reason: string) {
    const coop = await prisma.cooperative.findUnique({ where: { id } });
    if (!coop) throw ApiError.notFound("Cooperative not found");

    const activeLoans = await prisma.borrowerLoan.count({
      where: {
        borrower: { cooperativeId: id },
        status: "ACTIVE",
      },
    });

    if (activeLoans > 0) {
      throw ApiError.badRequest(`Cannot dissolve cooperative with ${activeLoans} active loans`);
    }

    await prisma.$transaction([
      prisma.borrowerProfile.updateMany({
        where: { cooperativeId: id },
        data: { cooperativeId: null },
      }),
      prisma.cooperative.update({
        where: { id },
        data: { status: "DISSOLVED", memberCount: 0 },
      }),
    ]);

    await prisma.auditLog.create({
      data: {
        userId: dissolvedBy,
        action: "COOPERATIVE_DISSOLVED",
        resource: "COOPERATIVE",
        resourceId: id,
        details: { name: coop.name, reason, previousMemberCount: coop.memberCount },
      },
    });

    logger.info("Cooperative dissolved", { id, reason });

    return { success: true, message: "Cooperative dissolved successfully" };
  }
}
