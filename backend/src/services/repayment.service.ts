import { Prisma, RepaymentMethod, RepaymentStatus } from "@prisma/client";
import { serializable } from "../utils/transaction";
import { ApiError } from "../utils/api-error";
import { prisma } from "../config/prisma";
import { getPagination, paginatedResponse, PaginationQuery } from "../utils/pagination";

interface RepaymentQueryFilters extends PaginationQuery {
  status?: RepaymentStatus;
}

export class RepaymentService {
  static async getAll(lenderOrgId: string, query: RepaymentQueryFilters) {
    const { page, limit, skip } = getPagination(query);
    const where: Prisma.RepaymentWhereInput = { loan: { program: { lenderOrgId } } };
    if (query.status) where.status = query.status;

    const [repayments, total] = await Promise.all([
      prisma.repayment.findMany({
        where, skip, take: limit, orderBy: { dueDate: "asc" },
        include: {
          loan: {
            include: {
              borrower: { include: { user: { select: { firstName: true, lastName: true } } } },
              program: { select: { name: true } },
            },
          },
        },
      }),
      prisma.repayment.count({ where }),
    ]);

    return paginatedResponse(repayments, total, page, limit);
  }

  static async recordPayment(id: string, amount: number, method: RepaymentMethod, paymentRef: string, lenderOrgId: string) {
    if (!lenderOrgId) throw ApiError.forbidden();
    const paid = new Prisma.Decimal(amount);
    if (!paid.isPositive() || paid.decimalPlaces() > 2 || !paymentRef) throw ApiError.badRequest("A positive payment with at most two decimals and a reference is required");
    return serializable(async tx => {
      const repayment = await tx.repayment.findFirst({ where: { id, loan: { program: { lenderOrgId } } }, include: { loan: true } });
      if (!repayment) throw ApiError.notFound("Repayment not found");
      const existing = await tx.transaction.findUnique({ where: { reference: paymentRef } });
      if (existing) {
        const meta = existing.metadata as { repaymentId?: string; method?: string } | null;
        if (existing.type !== "REPAYMENT" || existing.loanId !== repayment.loanId || meta?.repaymentId !== id || meta.method !== method || !existing.amount.equals(paid)) throw ApiError.conflict("Payment reference already used");
        return repayment;
      }
      if (!["ACTIVE"].includes(repayment.loan.status)) throw ApiError.badRequest("Only active loans accept repayments");
      const totalPaid = new Prisma.Decimal(repayment.paidAmount || 0).add(paid);
      if (totalPaid.gt(repayment.amount)) throw ApiError.badRequest("Payment exceeds the installment balance");
      const transaction = await tx.transaction.create({ data: { reference: paymentRef, type: "REPAYMENT", status: "SUCCESS", amount: paid, loanId: repayment.loanId, borrowerId: repayment.loan.borrowerId, processedAt: new Date(), provider: "MANUAL", metadata: { repaymentId: id, method } } });
      const updated = await tx.repayment.update({ where: { id }, data: { paidAmount: totalPaid, status: totalPaid.equals(repayment.amount) ? "PAID" : "PARTIAL", paidAt: new Date(), paymentMethod: method, paymentRef, transactionId: transaction.id } });
      const amountPaid = repayment.loan.amountPaid.add(paid);
      if (amountPaid.gt(repayment.loan.totalRepayable)) throw ApiError.badRequest("Payment exceeds the loan balance");
      const next = await tx.repayment.findFirst({ where: { loanId: repayment.loanId, status: { not: "PAID" } }, orderBy: { dueDate: "asc" } });
      await tx.borrowerLoan.update({ where: { id: repayment.loanId }, data: { amountPaid, status: amountPaid.gte(repayment.loan.totalRepayable) ? "COMPLETED" : "ACTIVE", nextPaymentDate: next?.dueDate || null } });
      return updated;
    });
  }

  static async getBorrowerRepayments(userId: string) {
    return prisma.repayment.findMany({
      where: { loan: { borrower: { userId } } },
      include: { loan: { include: { program: { select: { name: true } } } } },
      orderBy: { dueDate: "asc" },
    });
  }
}
