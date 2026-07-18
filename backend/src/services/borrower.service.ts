import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { getPagination, paginatedResponse, PaginationQuery } from "../utils/pagination";

interface BorrowerQuery extends PaginationQuery {
  search?: string;
  crop?: string;
  state?: string;
  tier?: string;
  cooperativeId?: string;
  minFarmScore?: number;
  maxFarmScore?: number;
  status?: "ACTIVE" | "FLAGGED" | "BLACKLISTED";
  sortBy?: "newest" | "oldest" | "highestScore" | "lowestScore" | "mostLoans";
}

interface FlagInput {
  reason: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

interface BlacklistInput {
  reason: string;
  durationMonths: number | "PERMANENT";
}

export class BorrowerService {
  static async getAll(lenderOrgId: string, query: BorrowerQuery) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.BorrowerProfileWhereInput = {
      loans: { some: { program: { lenderOrgId } } },
    };

    if (query.search && query.search.length <= 100) {
      where.user = {
        OR: [
          { firstName: { contains: query.search, mode: "insensitive" } },
          { lastName: { contains: query.search, mode: "insensitive" } },
          { email: { contains: query.search, mode: "insensitive" } },
        ],
      };
    }
    if (query.crop) where.primaryCrop = query.crop;
    if (query.state) where.state = query.state;
    if (query.tier) where.farmScoreTier = query.tier;

    const [borrowers, total] = await Promise.all([
      prisma.borrowerProfile.findMany({
        where, skip, take: limit,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
          _count: { select: { loans: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.borrowerProfile.count({ where }),
    ]);

    return paginatedResponse(borrowers, total, page, limit);
  }

  static async getById(id: string) {
    const borrower = await prisma.borrowerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true, createdAt: true } },
        loans: { include: { program: { select: { name: true, interestRate: true } }, repayments: true } },
        farmReports: { take: 5, orderBy: { createdAt: "desc" } },
        scoreHistory: { take: 10, orderBy: { calculatedAt: "desc" } },
      },
    });
    if (!borrower) throw ApiError.notFound("Borrower not found");
    return borrower;
  }

  static async getByIdForLender(id: string, lenderOrgId: string) {
    const borrower = await prisma.borrowerProfile.findFirst({
      where: {
        id,
        loans: { some: { program: { lenderOrgId } } },
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true, createdAt: true } },
        loans: {
          where: { program: { lenderOrgId } },
          include: { program: { select: { name: true, interestRate: true } }, repayments: true },
        },
        farmReports: { take: 5, orderBy: { createdAt: "desc" } },
        scoreHistory: { take: 10, orderBy: { calculatedAt: "desc" } },
      },
    });
    if (!borrower) throw ApiError.notFound("Borrower not found or access denied");
    return borrower;
  }

  static async getMyProfile(userId: string) {
    const borrower = await prisma.borrowerProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
        loans: { include: { program: { select: { name: true, interestRate: true, lenderOrg: { select: { name: true } } } }, repayments: true } },
        farmReports: { take: 10, orderBy: { createdAt: "desc" } },
        scoreHistory: { take: 10, orderBy: { calculatedAt: "desc" } },
      },
    });
    if (!borrower) throw ApiError.notFound("Borrower profile not found");
    return borrower;
  }

  static async getLoans(borrowerId: string, lenderOrgId: string) {
    const loans = await prisma.borrowerLoan.findMany({
      where: {
        borrowerId,
        program: { lenderOrgId },
      },
      include: {
        program: { select: { name: true, interestRate: true, durationMonths: true } },
        disbursements: { orderBy: { trancheNumber: "asc" } },
        repayments: { orderBy: { dueDate: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return loans.map((loan) => {
      const totalDisbursed = loan.disbursements
        .filter((d) => d.status === "COMPLETED")
        .reduce((sum, d) => sum + Number(d.amount), 0);
      const totalRepaid = loan.repayments
        .filter((r) => r.status === "PAID")
        .reduce((sum, r) => sum + Number(r.paidAmount || r.amount), 0);

      return {
        ...loan,
        amount: Number(loan.amount),
        totalRepayable: Number(loan.totalRepayable),
        amountPaid: Number(loan.amountPaid),
        totalDisbursed,
        totalRepaid,
        outstandingBalance: Number(loan.totalRepayable) - totalRepaid,
      };
    });
  }

  static async getFarmReports(borrowerId: string, lenderOrgId: string) {
    const reports = await prisma.farmReport.findMany({
      where: {
        borrowerId,
        borrower: { loans: { some: { program: { lenderOrgId } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return reports;
  }

  static async getFarmScore(borrowerId: string) {
    const borrower = await prisma.borrowerProfile.findUnique({
      where: { id: borrowerId },
      select: {
        farmScore: true,
        farmScoreTier: true,
        scoreHistory: {
          take: 12,
          orderBy: { calculatedAt: "desc" },
        },
      },
    });

    if (!borrower) throw ApiError.notFound("Borrower not found");

    const latestComponents = borrower.scoreHistory[0]?.components as Record<string, number> | undefined;

    return {
      currentScore: borrower.farmScore,
      tier: borrower.farmScoreTier,
      components: latestComponents || {},
      history: borrower.scoreHistory,
    };
  }

  static async getDocuments(borrowerId: string) {
    const documents = await prisma.document.findMany({
      where: { borrowerId },
      orderBy: { createdAt: "desc" },
    });

    return documents;
  }

  static async getActivity(borrowerId: string, lenderOrgId: string) {
    const [loans, applications, farmReports, scoreHistory] = await Promise.all([
      prisma.borrowerLoan.findMany({
        where: { borrowerId, program: { lenderOrgId } },
        include: {
          disbursements: { where: { status: "COMPLETED" } },
          repayments: { where: { status: "PAID" } },
        },
      }),
      prisma.application.findMany({
        where: { borrowerId, program: { lenderOrgId } },
        select: { id: true, status: true, submittedAt: true, reviewedAt: true, amount: true },
      }),
      prisma.farmReport.findMany({
        where: { borrowerId },
        select: { id: true, cropStage: true, createdAt: true, status: true },
      }),
      prisma.farmScoreHistory.findMany({
        where: { borrowerId },
        select: { score: true, previousScore: true, calculatedAt: true },
        orderBy: { calculatedAt: "desc" },
        take: 20,
      }),
    ]);

    const events: Array<{
      type: string;
      date: Date;
      title: string;
      description?: string;
      amount?: number;
    }> = [];

    applications.forEach((app) => {
      if (app.submittedAt) {
        events.push({
          type: "APPLICATION_SUBMITTED",
          date: app.submittedAt,
          title: "Application Submitted",
          amount: Number(app.amount),
        });
      }
      if (app.reviewedAt && app.status === "APPROVED") {
        events.push({
          type: "APPLICATION_APPROVED",
          date: app.reviewedAt,
          title: "Application Approved",
          amount: Number(app.amount),
        });
      }
      if (app.reviewedAt && app.status === "REJECTED") {
        events.push({
          type: "APPLICATION_REJECTED",
          date: app.reviewedAt,
          title: "Application Rejected",
        });
      }
    });

    loans.forEach((loan) => {
      loan.disbursements.forEach((d) => {
        if (d.processedAt) {
          events.push({
            type: "DISBURSEMENT",
            date: d.processedAt,
            title: `Tranche ${d.trancheNumber} Disbursed`,
            amount: Number(d.amount),
          });
        }
      });
      loan.repayments.forEach((r) => {
        if (r.paidAt) {
          events.push({
            type: "REPAYMENT",
            date: r.paidAt,
            title: "Payment Received",
            amount: Number(r.paidAmount || r.amount),
          });
        }
      });
    });

    farmReports.forEach((report) => {
      events.push({
        type: "FARM_REPORT",
        date: report.createdAt,
        title: `Farm Report: ${report.cropStage}`,
        description: report.status,
      });
    });

    scoreHistory.forEach((entry) => {
      const change = entry.score - (entry.previousScore || entry.score);
      if (change !== 0) {
        events.push({
          type: "FARMSCORE_CHANGE",
          date: entry.calculatedAt,
          title: `FarmScore ${change > 0 ? "+" : ""}${change}`,
          description: `${entry.previousScore || 0} → ${entry.score}`,
        });
      }
    });

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async flag(borrowerId: string, reviewerId: string, data: FlagInput) {
    const borrower = await prisma.borrowerProfile.findUnique({ where: { id: borrowerId } });
    if (!borrower) throw ApiError.notFound("Borrower not found");

    await prisma.auditLog.create({
      data: {
        userId: reviewerId,
        action: "BORROWER_FLAGGED",
        resource: "BORROWER",
        resourceId: borrowerId,
        details: {
          reason: data.reason,
          severity: data.severity,
        },
      },
    });

    return { success: true, message: `Borrower flagged with severity: ${data.severity}` };
  }

  static async blacklist(borrowerId: string, reviewerId: string, data: BlacklistInput) {
    const borrower = await prisma.borrowerProfile.findUnique({ where: { id: borrowerId } });
    if (!borrower) throw ApiError.notFound("Borrower not found");

    const result = await prisma.$transaction(async (tx) => {
      const currentScore = borrower.farmScore || 0;
      await tx.farmScoreHistory.create({
        data: {
          borrowerId,
          score: 0,
          previousScore: currentScore,
          tier: "BLACKLISTED",
          components: { blacklistPenalty: -currentScore },
        },
      });

      await tx.borrowerProfile.update({
        where: { id: borrowerId },
        data: {
          farmScore: 0,
          farmScoreTier: "BLACKLISTED",
        },
      });

      await tx.auditLog.create({
        data: {
          userId: reviewerId,
          action: "BORROWER_BLACKLISTED",
          resource: "BORROWER",
          resourceId: borrowerId,
          details: {
            reason: data.reason,
            durationMonths: data.durationMonths,
            previousScore: currentScore,
          },
        },
      });

      return { success: true };
    });

    return result;
  }

  static async unblacklist(borrowerId: string, reviewerId: string, reason: string) {
    const borrower = await prisma.borrowerProfile.findUnique({ where: { id: borrowerId } });
    if (!borrower) throw ApiError.notFound("Borrower not found");
    if (borrower.farmScoreTier !== "BLACKLISTED") {
      throw ApiError.badRequest("Borrower is not blacklisted");
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.farmScoreHistory.create({
        data: {
          borrowerId,
          score: 300,
          previousScore: 0,
          tier: "POOR",
          components: { blacklistRemoved: 300 },
        },
      });

      await tx.borrowerProfile.update({
        where: { id: borrowerId },
        data: {
          farmScore: 300,
          farmScoreTier: "POOR",
        },
      });

      await tx.auditLog.create({
        data: {
          userId: reviewerId,
          action: "BORROWER_UNBLACKLISTED",
          resource: "BORROWER",
          resourceId: borrowerId,
          details: { reason },
        },
      });

      return { success: true };
    });

    return result;
  }
}
