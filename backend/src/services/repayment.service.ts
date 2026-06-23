import { Prisma, RepaymentMethod, RepaymentStatus } from "@prisma/client";
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

  static async recordPayment(id: string, amount: number, method: RepaymentMethod) {
    return prisma.repayment.update({
      where: { id },
      data: { status: "PAID", paidAmount: amount, paidAt: new Date(), paymentMethod: method },
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
