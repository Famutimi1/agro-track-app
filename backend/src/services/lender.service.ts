import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";

type UpdateLenderOrgInput = Partial<Omit<Prisma.LenderOrganizationUpdateInput, "users" | "programs" | "cooperatives" | "webhooks">>;

export class LenderService {
  static async getOrganization(id: string) {
    const org = await prisma.lenderOrganization.findUnique({
      where: { id },
      include: {
        _count: { select: { programs: true, users: true } },
      },
    });
    if (!org) throw ApiError.notFound("Organization not found");
    return org;
  }

  static async updateOrganization(id: string, data: UpdateLenderOrgInput) {
    return prisma.lenderOrganization.update({ where: { id }, data });
  }

  static async getDashboardStats(lenderId: string) {
    const [totalBorrowers, activeLoans, totalDisbursed, repaymentsDue, totalRepaid, programCount, applicationsPending] = await Promise.all([
      prisma.borrowerProfile.count({ where: { loans: { some: { program: { lenderOrgId: lenderId } } } } }),
      prisma.borrowerLoan.count({ where: { program: { lenderOrgId: lenderId }, status: "ACTIVE" } }),
      prisma.disbursement.aggregate({
        where: { loan: { program: { lenderOrgId: lenderId } }, status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.repayment.aggregate({
        where: { loan: { program: { lenderOrgId: lenderId } }, status: "PENDING" },
        _sum: { amount: true },
      }),
      prisma.borrowerLoan.aggregate({ where: { program: { lenderOrgId: lenderId } }, _sum: { amountPaid: true } }),
      prisma.program.count({ where: { lenderOrgId: lenderId } }),
      prisma.application.count({ where: { program: { lenderOrgId: lenderId }, status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    ]);

    return {
      totalBorrowers,
      activeLoans,
      totalDisbursed: totalDisbursed._sum.amount || 0,
      repaymentsDue: repaymentsDue._sum.amount || 0,
      totalRepaid: totalRepaid._sum.amountPaid || 0,
      programCount,
      applicationsPending,
    };
  }

  static async getTeamMembers(lenderId: string) {
    return prisma.user.findMany({
      where: { lenderOrgId: lenderId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, avatarUrl: true, lastLoginAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
