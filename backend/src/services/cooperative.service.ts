import { CoopStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { getPagination, paginatedResponse, PaginationQuery } from "../utils/pagination";

interface CreateCooperativeInput {
  name: string;
  state: string;
  lga?: string;
  address?: string;
  regNumber?: string;
  chairPersonId?: string;
  maxMembers?: number;
}

interface CooperativeQueryFilters extends PaginationQuery {
  state?: string;
  status?: CoopStatus;
  lenderOrgId?: string;
}

export class CooperativeService {
  static async create(lenderOrgId: string, data: CreateCooperativeInput) {
    if (data.regNumber) {
      const existing = await prisma.cooperative.findUnique({ where: { regNumber: data.regNumber } });
      if (existing) throw ApiError.conflict("Registration number already exists");
    }

    return prisma.cooperative.create({
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
  }

  static async getAll(query: CooperativeQueryFilters) {
    const { page, limit, skip } = getPagination(query);
    const where: Prisma.CooperativeWhereInput = {};
    if (query.state) where.state = query.state;
    if (query.status) where.status = query.status;
    if (query.lenderOrgId) where.lenderOrgId = query.lenderOrgId;

    const [cooperatives, total] = await Promise.all([
      prisma.cooperative.findMany({
        where,
        include: {
          _count: { select: { members: true } },
          lenderOrg: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.cooperative.count({ where }),
    ]);

    return paginatedResponse(cooperatives, total, page, limit);
  }

  static async getById(id: string) {
    const coop = await prisma.cooperative.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { firstName: true, lastName: true, phone: true } } },
          take: 50,
        },
        lenderOrg: { select: { name: true } },
      },
    });
    if (!coop) throw ApiError.notFound("Cooperative not found");
    return coop;
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

  static async addMember(cooperativeId: string, borrowerId: string) {
    const coop = await prisma.cooperative.findUnique({ where: { id: cooperativeId } });
    if (!coop) throw ApiError.notFound("Cooperative not found");
    if (coop.status !== "ACTIVE") throw ApiError.badRequest("Cooperative is not active");
    if (coop.memberCount >= coop.maxMembers) throw ApiError.badRequest("Cooperative is at maximum capacity");

    const borrower = await prisma.borrowerProfile.findUnique({ where: { id: borrowerId } });
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

    return this.getById(cooperativeId);
  }

  static async removeMember(cooperativeId: string, borrowerId: string) {
    const borrower = await prisma.borrowerProfile.findUnique({ where: { id: borrowerId } });
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

    return this.getById(cooperativeId);
  }

  static async getMembers(cooperativeId: string, query: PaginationQuery) {
    const { page, limit, skip } = getPagination(query);

    const [members, total] = await Promise.all([
      prisma.borrowerProfile.findMany({
        where: { cooperativeId },
        include: {
          user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          loans: { where: { status: "ACTIVE" }, take: 1 },
        },
        skip,
        take: limit,
      }),
      prisma.borrowerProfile.count({ where: { cooperativeId } }),
    ]);

    return paginatedResponse(members, total, page, limit);
  }

  static async getStats(cooperativeId: string) {
    const coop = await prisma.cooperative.findUnique({ where: { id: cooperativeId } });
    if (!coop) throw ApiError.notFound("Cooperative not found");

    const members = await prisma.borrowerProfile.findMany({
      where: { cooperativeId },
      select: { id: true, farmScore: true },
    });

    const memberIds = members.map((m) => m.id);

    const [totalLoansValue, totalRepaid, activeLoans, averageScore] = await Promise.all([
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
      members.length > 0
        ? members.reduce((sum, m) => sum + m.farmScore, 0) / members.length
        : 0,
    ]);

    const totalDisbursed = Number(totalLoansValue._sum.amount || 0);
    const totalRepaidAmount = Number(totalRepaid._sum.paidAmount || 0);
    const repaymentRate = totalDisbursed > 0 ? (totalRepaidAmount / totalDisbursed) * 100 : 0;

    // Update coop stats
    await prisma.cooperative.update({
      where: { id: cooperativeId },
      data: {
        totalLoans: totalDisbursed,
        repaymentRate: Math.round(repaymentRate * 10) / 10,
      },
    });

    return {
      memberCount: coop.memberCount,
      averageFarmScore: Math.round(averageScore),
      totalDisbursed,
      totalRepaid: totalRepaidAmount,
      repaymentRate: Math.round(repaymentRate * 10) / 10,
      activeLoans,
    };
  }

  static async suspend(id: string) {
    return prisma.cooperative.update({
      where: { id },
      data: { status: "SUSPENDED" },
    });
  }

  static async reactivate(id: string) {
    return prisma.cooperative.update({
      where: { id },
      data: { status: "ACTIVE" },
    });
  }
}
