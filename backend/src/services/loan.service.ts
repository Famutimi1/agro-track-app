import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AuthenticatedUser } from "../middlewares/auth";
import { ApiError } from "../utils/api-error";
import { getPagination, paginatedResponse, PaginationQuery } from "../utils/pagination";

export function loanScope(user: AuthenticatedUser): Prisma.BorrowerLoanWhereInput {
  if (user.role === "BORROWER") return { borrower: { userId: user.sub } };
  if (user.role.startsWith("LENDER_") && user.lenderId) return { program: { lenderOrgId: user.lenderId } };
  throw ApiError.forbidden("Loan access required");
}
const include = { program: { select: { name: true } }, borrower: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } } };
export class LoanService {
  static async list(user: AuthenticatedUser, query: PaginationQuery & { status?: string; programId?: string }) {
    const { page, limit, skip } = getPagination(query);
    const where: Prisma.BorrowerLoanWhereInput = { ...loanScope(user), ...(query.status ? { status: query.status as Prisma.EnumLoanStatusFilter } : {}), ...(query.programId ? { programId: query.programId } : {}) };
    const [rows, total] = await Promise.all([prisma.borrowerLoan.findMany({ where, skip, take: limit, include, orderBy: { createdAt: "desc" } }), prisma.borrowerLoan.count({ where })]);
    return paginatedResponse(rows, total, page, limit);
  }
  static async get(id: string, user: AuthenticatedUser) {
    const loan = await prisma.borrowerLoan.findFirst({ where: { id, ...loanScope(user) }, include: { ...include, disbursements: { orderBy: { trancheNumber: "asc" } }, repayments: { orderBy: { dueDate: "asc" } } } });
    if (!loan) throw ApiError.notFound("Loan not found");
    return loan;
  }
}
