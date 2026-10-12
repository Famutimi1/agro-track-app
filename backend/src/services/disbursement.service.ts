import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { getPagination, paginatedResponse, PaginationQuery } from "../utils/pagination";
import { serializable } from "../utils/transaction";
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

  static async approve(id: string, approvedBy: string, lenderOrgId: string) {
    // Use transaction to prevent race conditions
    if (!lenderOrgId) throw ApiError.forbidden();
    return serializable(async (tx) => {
      const d = await tx.disbursement.findFirst({
        where: { id, loan: { program: { lenderOrgId } } },
        include: { loan: true },
      });
      if (!d) throw ApiError.notFound("Disbursement not found");
      if (d.status !== "PENDING") throw ApiError.badRequest("Can only approve pending disbursements");

      // For multi-tranche: verify previous tranches are completed
      if (d.trancheNumber > 1) {
        const prevTranche = await tx.disbursement.findFirst({
          where: { loanId: d.loanId, trancheNumber: d.trancheNumber - 1 },
        });
        if (!prevTranche || prevTranche.status !== "COMPLETED") {
          throw ApiError.badRequest("Previous tranche must be completed before approving the next");
        }
      }

      if (!["PENDING", "ACTIVE"].includes(d.loan.status)) throw ApiError.badRequest("Loan is not eligible for disbursement");
      if (d.trancheNumber > 1) {
        const previous = await tx.disbursement.findUniqueOrThrow({ where: { loanId_trancheNumber: { loanId: d.loanId, trancheNumber: d.trancheNumber - 1 } } });
        if (!previous.processedAt) throw ApiError.badRequest("Previous tranche has no confirmed payment timestamp");
        const report = await tx.farmReport.findFirst({ where: { borrowerId: d.loan.borrowerId, status: "VERIFIED", verifiedAt: { gte: previous.processedAt! }, createdAt: { gte: previous.processedAt! } } });
        if (!report) throw ApiError.badRequest("A verified farm report after the previous disbursement is required");
        if (d.trancheNumber > 2) {
          const visit = await tx.fieldVisit.findFirst({ where: { borrowerId: d.loan.borrowerId, status: "COMPLETED", completedAt: { gte: previous.processedAt! } } });
          if (!visit) throw ApiError.badRequest("A completed field visit after the previous disbursement is required");
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

  static async process(_id: string, _paymentRef: string) {
    // A caller-supplied reference is not proof that a bank transfer succeeded.
    throw ApiError.badRequest("Payment processing requires a verified provider integration and is not enabled");
  }

  static async reject(id: string, reason: string, lenderOrgId: string) {
    if (!lenderOrgId) throw ApiError.forbidden();
    const changed = await prisma.disbursement.updateMany({ where: { id, loan: { program: { lenderOrgId } }, status: { in: ["PENDING", "APPROVED"] } }, data: { status: "FAILED", failureReason: reason } });
    if (!changed.count) throw ApiError.notFound("Rejectable disbursement not found");
    return prisma.disbursement.findUniqueOrThrow({ where: { id } });
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
