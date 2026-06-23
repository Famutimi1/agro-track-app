import { prisma } from "../config/prisma";
import { getPagination, paginatedResponse, PaginationQuery } from "../utils/pagination";

export class AdminService {
  static async getPlatformStats() {
    const [totalUsers, totalLenders, totalBorrowers, totalLoans, totalDisbursed, totalRepaid] = await Promise.all([
      prisma.user.count(),
      prisma.lenderOrganization.count(),
      prisma.borrowerProfile.count(),
      prisma.borrowerLoan.count(),
      prisma.disbursement.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
      prisma.repayment.aggregate({ where: { status: "PAID" }, _sum: { paidAmount: true } }),
    ]);

    return {
      totalUsers,
      totalLenders,
      totalBorrowers,
      totalLoans,
      totalDisbursed: totalDisbursed._sum.amount || 0,
      totalRepaid: totalRepaid._sum.paidAmount || 0,
    };
  }

  static async getLenderAccounts(query: PaginationQuery & { search?: string; plan?: string }) {
    const { page, limit, skip } = getPagination(query);
    const where: any = {};
    if (query.search) where.name = { contains: query.search, mode: "insensitive" };
    if (query.plan) where.plan = query.plan;

    const [lenders, total] = await Promise.all([
      prisma.lenderOrganization.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        include: { _count: { select: { programs: true, users: true } } },
      }),
      prisma.lenderOrganization.count({ where }),
    ]);

    return paginatedResponse(lenders, total, page, limit);
  }

  static async getTickets(query: PaginationQuery & { status?: string; priority?: string }) {
    const { page, limit, skip } = getPagination(query);
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return paginatedResponse(tickets, total, page, limit);
  }

  static async getFeatureFlags() {
    return prisma.featureFlag.findMany({ orderBy: { key: "asc" } });
  }

  static async toggleFeatureFlag(id: string) {
    const flag = await prisma.featureFlag.findUnique({ where: { id } });
    if (!flag) return null;
    return prisma.featureFlag.update({ where: { id }, data: { enabled: !flag.enabled } });
  }

  static async getAuditLog(query: PaginationQuery) {
    const { page, limit, skip } = getPagination(query);
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip, take: limit, orderBy: { createdAt: "desc" },
        include: { user: { select: { firstName: true, lastName: true, email: true, role: true } } },
      }),
      prisma.auditLog.count(),
    ]);
    return paginatedResponse(logs, total, page, limit);
  }
}
