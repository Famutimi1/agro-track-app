import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { getPagination, paginatedResponse, PaginationQuery } from "../utils/pagination";
import { logger } from "../config/logger";
import { emitToUser, emitToLender } from "../config/socket";
import { NotificationService, NotificationTemplates } from "./notification.service";

interface DisbursementQuery extends PaginationQuery {
  status?: string;
  programId?: string;
  state?: string;
  trancheNumber?: number;
  dateFrom?: string;
  dateTo?: string;
}

export class DisbursementService {
  static async getAll(lenderOrgId: string, query: DisbursementQuery) {
    const { page, limit, skip } = getPagination(query);
    const where: Prisma.DisbursementWhereInput = { loan: { program: { lenderOrgId } } };

    if (query.status) where.status = query.status as any;
    if (query.programId) where.loan = { ...where.loan as any, programId: query.programId };
    if (query.state) where.loan = { ...where.loan as any, borrower: { state: query.state } };
    if (query.trancheNumber) where.trancheNumber = Number(query.trancheNumber);
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }

    const [disbursements, total] = await Promise.all([
      prisma.disbursement.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        include: {
          loan: {
            include: {
              borrower: {
                select: {
                  id: true,
                  farmerId: true,
                  farmScore: true,
                  farmScoreTier: true,
                  state: true,
                  user: { select: { firstName: true, lastName: true } },
                },
              },
              program: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.disbursement.count({ where }),
    ]);

    const formatted = disbursements.map((d) => ({
      ...d,
      amount: Number(d.amount),
      daysWaiting: Math.floor((Date.now() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    }));

    return paginatedResponse(formatted, total, page, limit);
  }

  static async getPending(lenderOrgId: string, query: PaginationQuery) {
    const { page, limit, skip } = getPagination(query);
    const where: Prisma.DisbursementWhereInput = {
      status: { in: ["PENDING", "APPROVED"] },
      loan: { program: { lenderOrgId } },
    };

    const [disbursements, total] = await Promise.all([
      prisma.disbursement.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: "asc" },
        include: {
          loan: {
            include: {
              borrower: {
                select: {
                  id: true,
                  farmerId: true,
                  state: true,
                  user: { select: { firstName: true, lastName: true } },
                },
              },
              program: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.disbursement.count({ where }),
    ]);

    const formatted = disbursements.map((d) => ({
      ...d,
      amount: Number(d.amount),
      daysWaiting: Math.floor((Date.now() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    }));

    return paginatedResponse(formatted, total, page, limit);
  }

  static async getById(id: string, lenderOrgId: string) {
    const disbursement = await prisma.disbursement.findFirst({
      where: {
        id,
        loan: { program: { lenderOrgId } },
      },
      include: {
        loan: {
          include: {
            borrower: {
              select: {
                id: true,
                farmerId: true,
                state: true,
                user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
              },
            },
            program: { select: { id: true, name: true, interestRate: true } },
          },
        },
      },
    });

    if (!disbursement) throw ApiError.notFound("Disbursement not found");

    return {
      ...disbursement,
      amount: Number(disbursement.amount),
    };
  }

  static async getStats(lenderOrgId: string) {
    const baseWhere = { loan: { program: { lenderOrgId } } };

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      pendingCount,
      pendingAmount,
      approvedTodayCount,
      approvedTodayAmount,
      releasedMonthCount,
      releasedMonthAmount,
      allDisbursements,
    ] = await Promise.all([
      prisma.disbursement.count({
        where: { ...baseWhere, status: { in: ["PENDING", "APPROVED"] } },
      }),
      prisma.disbursement.aggregate({
        where: { ...baseWhere, status: { in: ["PENDING", "APPROVED"] } },
        _sum: { amount: true },
      }),
      prisma.disbursement.count({
        where: { ...baseWhere, status: "APPROVED", approvedAt: { gte: startOfDay } },
      }),
      prisma.disbursement.aggregate({
        where: { ...baseWhere, status: "APPROVED", approvedAt: { gte: startOfDay } },
        _sum: { amount: true },
      }),
      prisma.disbursement.count({
        where: { ...baseWhere, status: "COMPLETED", processedAt: { gte: startOfMonth } },
      }),
      prisma.disbursement.aggregate({
        where: { ...baseWhere, status: "COMPLETED", processedAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.disbursement.findMany({
        where: { ...baseWhere, status: "COMPLETED", processedAt: { not: null }, approvedAt: { not: null } },
        select: { approvedAt: true, processedAt: true },
        take: 100,
      }),
    ]);

    let avgProcessingDays = 0;
    if (allDisbursements.length > 0) {
      const totalDays = allDisbursements.reduce((sum, d) => {
        if (d.approvedAt && d.processedAt) {
          return sum + (d.processedAt.getTime() - d.approvedAt.getTime()) / (1000 * 60 * 60 * 24);
        }
        return sum;
      }, 0);
      avgProcessingDays = Math.round((totalDays / allDisbursements.length) * 10) / 10;
    }

    const layerBreakdown = await prisma.disbursement.groupBy({
      by: ["trancheNumber"],
      where: { ...baseWhere, status: "COMPLETED" },
      _count: true,
      _sum: { amount: true },
    });

    const last6Months = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
        return prisma.disbursement.aggregate({
          where: {
            ...baseWhere,
            status: "COMPLETED",
            processedAt: { gte: date, lte: endDate },
          },
          _sum: { amount: true },
          _count: true,
        }).then((r) => ({
          month: date.toLocaleString("default", { month: "short", year: "2-digit" }),
          amount: Number(r._sum.amount || 0),
          count: r._count,
        }));
      })
    );

    return {
      pendingApproval: { count: pendingCount, amount: Number(pendingAmount._sum.amount || 0) },
      approvedToday: { count: approvedTodayCount, amount: Number(approvedTodayAmount._sum.amount || 0) },
      releasedThisMonth: { count: releasedMonthCount, amount: Number(releasedMonthAmount._sum.amount || 0) },
      avgProcessingDays,
      layerBreakdown: layerBreakdown.map((l) => ({
        layer: l.trancheNumber,
        count: l._count,
        amount: Number(l._sum.amount || 0),
      })),
      monthlyTrend: last6Months.reverse(),
    };
  }

  static async getByLoan(loanId: string) {
    return prisma.disbursement.findMany({
      where: { loanId },
      orderBy: { trancheNumber: "asc" },
    });
  }

  static async createTranches(loanId: string) {
    const loan = await prisma.borrowerLoan.findUnique({
      where: { id: loanId },
      include: { program: true },
    });
    if (!loan) throw ApiError.notFound("Loan not found");

    const trancheCount = loan.trancheCount;
    const totalAmount = Number(loan.amount);
    const amountPerTranche = Math.floor(totalAmount / trancheCount);
    const remainder = totalAmount - amountPerTranche * (trancheCount - 1);

    const tranches = Array.from({ length: trancheCount }, (_, i) => ({
      loanId,
      trancheNumber: i + 1,
      amount: i === trancheCount - 1 ? remainder : amountPerTranche,
      status: "PENDING" as const,
    }));

    await prisma.disbursement.createMany({ data: tranches });

    logger.info("Disbursement tranches created", { loanId, trancheCount });

    return prisma.disbursement.findMany({
      where: { loanId },
      orderBy: { trancheNumber: "asc" },
    });
  }

  static async approve(id: string, approvedBy: string) {
    // Approving a tranche disburses it in a single step: the tranche is marked
    // COMPLETED, a payment transaction is recorded, and (for the first tranche)
    // the loan is activated. A transaction prevents race conditions.
    const result = await prisma.$transaction(async (tx) => {
      const d = await tx.disbursement.findUnique({
        where: { id },
        include: {
          loan: {
            include: {
              borrower: { select: { userId: true } },
              program: { select: { lenderOrgId: true } },
            },
          },
        },
      });
      if (!d) throw ApiError.notFound("Disbursement not found");
      if (d.status !== "PENDING") throw ApiError.badRequest("Can only approve pending disbursements");

      // For multi-tranche: verify previous tranches are completed
      if (d.trancheNumber > 1) {
        const prevTranche = await tx.disbursement.findFirst({
          where: { loanId: d.loanId, trancheNumber: d.trancheNumber - 1 },
        });
        if (prevTranche && prevTranche.status !== "COMPLETED") {
          throw ApiError.badRequest("Previous tranche must be completed before approving the next");
        }
      }

      // Check for any in-progress approvals (another concurrent request)
      const pendingApprovals = await tx.disbursement.count({
        where: {
          loanId: d.loanId,
          status: { in: ["APPROVED", "PROCESSING"] },
        },
      });
      if (pendingApprovals > 0) {
        throw ApiError.badRequest("Another tranche is currently being processed");
      }

      const now = new Date();
      const paymentRef = `DISB-${d.id}-${now.getTime()}`;

      const updated = await tx.disbursement.update({
        where: { id },
        data: {
          status: "COMPLETED",
          approvedBy,
          approvedAt: now,
          processedAt: now,
          paymentRef,
        },
      });

      // Record the disbursement transaction
      await tx.transaction.create({
        data: {
          reference: paymentRef,
          type: "DISBURSEMENT",
          status: "SUCCESS",
          amount: d.amount,
          loanId: d.loanId,
          borrowerId: d.loan.borrowerId,
          processedAt: now,
        },
      });

      // Advance the loan's tranche tracker; activate on first disbursement
      await tx.borrowerLoan.update({
        where: { id: d.loanId },
        data: {
          currentTranche: d.trancheNumber,
          ...(d.trancheNumber === 1 ? { status: "ACTIVE", startDate: now } : {}),
        },
      });

      await tx.auditLog.create({
        data: {
          userId: approvedBy,
          action: "DISBURSEMENT_APPROVED",
          resource: "DISBURSEMENT",
          resourceId: id,
          details: { trancheNumber: d.trancheNumber, amount: Number(d.amount), paymentRef },
        },
      });

      logger.info("Disbursement approved and released", {
        id,
        tranche: d.trancheNumber,
        loanId: d.loanId,
      });

      return {
        disbursement: updated,
        loanId: d.loanId,
        trancheNumber: d.trancheNumber,
        amount: Number(d.amount),
        borrowerUserId: d.loan.borrower.userId,
        lenderOrgId: d.loan.program.lenderOrgId,
      };
    });

    // Fire notifications and real-time updates outside the transaction
    this.emitDisbursementCompleted(result);

    return result.disbursement;
  }

  // Notify the borrower and refresh both lender and borrower views in real time.
  private static emitDisbursementCompleted(result: {
    loanId: string;
    trancheNumber: number;
    amount: number;
    borrowerUserId: string;
    lenderOrgId: string;
  }) {
    const { loanId, trancheNumber, amount, borrowerUserId, lenderOrgId } = result;

    NotificationService.send({
      userId: borrowerUserId,
      ...NotificationTemplates.disbursementReceived(amount, trancheNumber),
      actionUrl: "/borrower/loans",
    }).catch((err) =>
      logger.error("Failed to send disbursement notification", { loanId, err })
    );

    // Borrower's live views (My Loans, disbursement layers)
    emitToUser(borrowerUserId, "disbursement:processed", { loanId });
    emitToUser(borrowerUserId, "loan:updated", { loanId, status: "ACTIVE" });

    // Lender org's live views (disbursements queue, loan detail/list)
    emitToLender(lenderOrgId, "disbursement:processed", { loanId });
    emitToLender(lenderOrgId, "loan:updated", { loanId, status: "ACTIVE" });
  }

  static async process(id: string, paymentRef: string) {
    const d = await prisma.disbursement.findUnique({ where: { id } });
    if (!d) throw ApiError.notFound("Disbursement not found");
    if (d.status !== "APPROVED") throw ApiError.badRequest("Can only process approved disbursements");

    const updated = await prisma.disbursement.update({
      where: { id },
      data: { status: "COMPLETED", paymentRef, processedAt: new Date() },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        reference: paymentRef,
        type: "DISBURSEMENT",
        status: "SUCCESS",
        amount: d.amount,
        loanId: d.loanId,
        processedAt: new Date(),
      },
    });

    // If loan's first tranche, mark loan as active
    if (d.trancheNumber === 1) {
      await prisma.borrowerLoan.update({
        where: { id: d.loanId },
        data: { status: "ACTIVE", startDate: new Date() },
      });
    }

    logger.info("Disbursement processed", { id, paymentRef });

    return updated;
  }

  static async reject(id: string, reason: string, reviewerId: string) {
    const d = await prisma.disbursement.findUnique({
      where: { id },
      include: { loan: { include: { borrower: true } } },
    });
    if (!d) throw ApiError.notFound("Disbursement not found");
    if (!["PENDING", "APPROVED"].includes(d.status)) {
      throw ApiError.badRequest("Can only reject pending or approved disbursements");
    }

    const updated = await prisma.disbursement.update({
      where: { id },
      data: { status: "FAILED", failureReason: reason },
    });

    await prisma.auditLog.create({
      data: {
        userId: reviewerId,
        action: "DISBURSEMENT_REJECTED",
        resource: "DISBURSEMENT",
        resourceId: id,
        details: { reason, trancheNumber: d.trancheNumber, amount: Number(d.amount) },
      },
    });

    logger.info("Disbursement rejected", { id, reason });

    return updated;
  }

  static async retry(id: string, reviewerId: string) {
    const d = await prisma.disbursement.findUnique({ where: { id } });
    if (!d) throw ApiError.notFound("Disbursement not found");
    if (d.status !== "FAILED") throw ApiError.badRequest("Can only retry failed disbursements");

    const updated = await prisma.disbursement.update({
      where: { id },
      data: { status: "APPROVED", failureReason: null },
    });

    await prisma.auditLog.create({
      data: {
        userId: reviewerId,
        action: "DISBURSEMENT_RETRY",
        resource: "DISBURSEMENT",
        resourceId: id,
        details: { trancheNumber: d.trancheNumber },
      },
    });

    logger.info("Disbursement retry initiated", { id });

    return updated;
  }

  static async manualRelease(id: string, reviewerId: string, paymentRef: string, notes: string) {
    const d = await prisma.disbursement.findUnique({
      where: { id },
      include: {
        loan: {
          include: {
            borrower: { select: { userId: true } },
            program: { select: { lenderOrgId: true } },
          },
        },
      },
    });
    if (!d) throw ApiError.notFound("Disbursement not found");
    if (!["APPROVED", "FAILED"].includes(d.status)) {
      throw ApiError.badRequest("Can only manually release approved or failed disbursements");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.disbursement.update({
        where: { id },
        data: {
          status: "COMPLETED",
          paymentRef,
          processedAt: new Date(),
        },
      });

      await tx.transaction.create({
        data: {
          reference: paymentRef,
          type: "DISBURSEMENT",
          status: "SUCCESS",
          amount: d.amount,
          loanId: d.loanId,
          borrowerId: d.loan.borrowerId,
          processedAt: new Date(),
        },
      });

      if (d.trancheNumber === 1) {
        await tx.borrowerLoan.update({
          where: { id: d.loanId },
          data: { status: "ACTIVE", startDate: new Date() },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: reviewerId,
          action: "DISBURSEMENT_MANUAL_RELEASE",
          resource: "DISBURSEMENT",
          resourceId: id,
          details: { paymentRef, notes, trancheNumber: d.trancheNumber, amount: Number(d.amount) },
        },
      });

      return updated;
    });

    logger.info("Disbursement manually released", { id, paymentRef });

    this.emitDisbursementCompleted({
      loanId: d.loanId,
      trancheNumber: d.trancheNumber,
      amount: Number(d.amount),
      borrowerUserId: d.loan.borrower.userId,
      lenderOrgId: d.loan.program.lenderOrgId,
    });

    return result;
  }

  static async bulkApprove(ids: string[], approvedBy: string) {
    const results = await Promise.allSettled(
      ids.map((id) => this.approve(id, approvedBy))
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    logger.info("Bulk disbursement approval", { total: ids.length, succeeded, failed });

    return { succeeded, failed, total: ids.length };
  }

  static async bulkReject(ids: string[], reason: string, reviewerId: string) {
    const results = await Promise.allSettled(
      ids.map((id) => this.reject(id, reason, reviewerId))
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return { succeeded, failed, total: ids.length };
  }

  static async getTrancheStatus(loanId: string) {
    const loan = await prisma.borrowerLoan.findUnique({
      where: { id: loanId },
      select: { trancheCount: true, currentTranche: true, amount: true },
    });
    if (!loan) throw ApiError.notFound("Loan not found");

    const tranches = await prisma.disbursement.findMany({
      where: { loanId },
      orderBy: { trancheNumber: "asc" },
      select: {
        id: true,
        trancheNumber: true,
        amount: true,
        status: true,
        approvedAt: true,
        processedAt: true,
      },
    });

    const totalDisbursed = tranches
      .filter((t) => t.status === "COMPLETED")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      loanId,
      totalTranches: loan.trancheCount,
      currentTranche: loan.currentTranche,
      totalAmount: Number(loan.amount),
      totalDisbursed,
      remaining: Number(loan.amount) - totalDisbursed,
      tranches,
    };
  }
}
