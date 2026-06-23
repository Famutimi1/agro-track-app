import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { getPagination, paginatedResponse, PaginationQuery } from "../utils/pagination";
import { logger } from "../config/logger";

export class DisbursementService {
  static async getAll(lenderOrgId: string, query: PaginationQuery & { status?: string }) {
    const { page, limit, skip } = getPagination(query);
    const where: any = { loan: { program: { lenderOrgId } } };
    if (query.status) where.status = query.status;

    const [disbursements, total] = await Promise.all([
      prisma.disbursement.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        include: {
          loan: {
            include: {
              borrower: { include: { user: { select: { firstName: true, lastName: true } } } },
              program: { select: { name: true } },
            },
          },
        },
      }),
      prisma.disbursement.count({ where }),
    ]);

    return paginatedResponse(disbursements, total, page, limit);
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
    // Use transaction to prevent race conditions
    return prisma.$transaction(async (tx) => {
      const d = await tx.disbursement.findUnique({
        where: { id },
        include: { loan: true },
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

      const updated = await tx.disbursement.update({
        where: { id },
        data: { status: "APPROVED", approvedBy, approvedAt: new Date() },
      });

      // Update loan's current tranche tracker
      await tx.borrowerLoan.update({
        where: { id: d.loanId },
        data: { currentTranche: d.trancheNumber },
      });

      logger.info("Disbursement approved", { id, tranche: d.trancheNumber, loanId: d.loanId });

      return updated;
    });
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

  static async reject(id: string, reason: string) {
    const d = await prisma.disbursement.findUnique({ where: { id } });
    if (!d) throw ApiError.notFound("Disbursement not found");
    if (!["PENDING", "APPROVED"].includes(d.status)) {
      throw ApiError.badRequest("Can only reject pending or approved disbursements");
    }

    return prisma.disbursement.update({
      where: { id },
      data: { status: "FAILED", failureReason: reason },
    });
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
