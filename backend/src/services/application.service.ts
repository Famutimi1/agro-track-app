import { ApplicationStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { serializable } from "../utils/transaction";
import { AuthenticatedUser } from "../middlewares/auth";
import { getPagination, paginatedResponse, PaginationQuery } from "../utils/pagination";

interface BorrowerApplicationFilters extends PaginationQuery {
  status?: ApplicationStatus;
}

interface LenderApplicationFilters extends PaginationQuery {
  status?: ApplicationStatus;
  programId?: string;
}

export class ApplicationService {
  static async create(userId: string, data: { programId: string; amount: number; purpose?: string }) {
    return serializable(async tx => {
      if (new Prisma.Decimal(data.amount).decimalPlaces() > 2) throw ApiError.badRequest("Amount must have at most two decimal places");
      const borrower = await tx.borrowerProfile.findUnique({ where: { userId } });
      if (!borrower) throw ApiError.notFound("Borrower profile not found");

      const program = await tx.program.findUnique({ where: { id: data.programId } });
      if (!program) throw ApiError.notFound("Program not found");
      if (program.status !== "ACTIVE") throw ApiError.badRequest("Program is not accepting applications");

      if (data.amount < Number(program.minAmount) || data.amount > Number(program.maxAmount)) {
        throw ApiError.badRequest(`Amount must be between ₦${program.minAmount} and ₦${program.maxAmount}`);
      }

      if (program.targetCrops.length && !program.targetCrops.some(crop => crop.toLowerCase() === borrower.primaryCrop.toLowerCase())) throw ApiError.badRequest("Your crop is not eligible for this program");
      if (program.targetStates.length && !program.targetStates.some(state => state.toLowerCase() === borrower.state.toLowerCase())) throw ApiError.badRequest("Your state is not eligible for this program");
      if (program.requiredScore > 0 && borrower.farmScore < program.requiredScore) {
        throw ApiError.badRequest(`Minimum FarmScore of ${program.requiredScore} required. Your score: ${borrower.farmScore}`);
      }

      const existing = await tx.application.findFirst({
        where: {
          borrowerId: borrower.id,
          programId: data.programId,
          status: { in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW"] },
        },
      });
      if (existing) throw ApiError.conflict("You already have a pending application for this program");

      return tx.application.create({
        data: {
          borrowerId: borrower.id,
          programId: data.programId,
          amount: data.amount,
          purpose: data.purpose,
          farmScoreAtApply: borrower.farmScore,
          status: "DRAFT",
        },
        include: { program: { select: { name: true, lenderOrg: { select: { name: true } } } } },
      });
    });
  }

  static async submit(userId: string, applicationId: string) {
    return serializable(async tx => {
      const app = await tx.application.findFirst({ where: { id: applicationId, borrower: { userId }, status: "DRAFT" }, include: { program: true, borrower: true } });
      if (!app) throw ApiError.notFound("Draft application not found");
      if (app.program.status !== "ACTIVE") throw ApiError.badRequest("Program is not accepting applications");
      if (app.program.targetCrops.length && !app.program.targetCrops.some(crop => crop.toLowerCase() === app.borrower.primaryCrop.toLowerCase())) throw ApiError.badRequest("Your crop is not eligible for this program");
      if (app.program.targetStates.length && !app.program.targetStates.some(state => state.toLowerCase() === app.borrower.state.toLowerCase())) throw ApiError.badRequest("Your state is not eligible for this program");
      if (app.borrower.farmScore < app.program.requiredScore || app.amount.lt(app.program.minAmount) || app.amount.gt(app.program.maxAmount)) throw ApiError.badRequest("The application no longer meets this program's score or amount requirements");
      const changed = await tx.application.updateMany({ where: { id: applicationId, status: "DRAFT" }, data: { status: "SUBMITTED", submittedAt: new Date() } });
      if (!changed.count) throw ApiError.conflict("Application changed. Please refresh.");
      return tx.application.findUniqueOrThrow({ where: { id: applicationId }, include: { program: { select: { name: true } } } });
    });
  }

  static async withdraw(userId: string, applicationId: string) {
    const changed = await prisma.application.updateMany({ where: { id: applicationId, borrower: { userId }, status: { in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW"] } }, data: { status: "WITHDRAWN" } });
    if (!changed.count) throw ApiError.notFound("Withdrawable application not found");
    return prisma.application.findUniqueOrThrow({ where: { id: applicationId } });
  }

  static async review(
    reviewerId: string, lenderOrgId: string, applicationId: string,
    data: { status: "APPROVED" | "REJECTED"; rejectionReason?: string; notes?: string }
  ) {
    if (!lenderOrgId) throw ApiError.forbidden("Lender access required");
    return serializable(async tx => {
      const app = await tx.application.findFirst({ where: { id: applicationId, program: { lenderOrgId } }, include: { program: true } });
      if (!app) throw ApiError.notFound("Application not found");
      if (!["SUBMITTED", "UNDER_REVIEW"].includes(app.status)) throw ApiError.conflict("Application has already been reviewed or withdrawn");
      if (data.status === "REJECTED" && !data.rejectionReason?.trim()) throw ApiError.badRequest("Rejection reason is required");
      const updated = await tx.application.update({ where: { id: app.id }, data: {
        status: data.status, reviewedBy: reviewerId, reviewedAt: new Date(), rejectionReason: data.rejectionReason, notes: data.notes,
      } });
      if (data.status === "APPROVED") {
        const amount = new Prisma.Decimal(app.amount);
        const total = amount.mul(new Prisma.Decimal(1).add(new Prisma.Decimal(app.program.interestRate).div(100))).toDecimalPlaces(2);
        const trancheCount = app.program.trancheCount;
        const months = app.program.durationMonths;
        if (trancheCount < 1 || months < 1) throw ApiError.badRequest("Program has invalid repayment or tranche settings");
        const monthly = total.div(months).toDecimalPlaces(2, Prisma.Decimal.ROUND_DOWN);
        const trancheAmount = amount.div(trancheCount).toDecimalPlaces(2, Prisma.Decimal.ROUND_DOWN);
        if (!monthly.isPositive() || !trancheAmount.isPositive()) throw ApiError.badRequest("Program splits produce an empty installment or tranche");
        const now = new Date();
        const dueDate = (month: number) => {
          const day = now.getUTCDate();
          const date = new Date(now); date.setUTCDate(1); date.setUTCMonth(date.getUTCMonth() + month);
          const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
          date.setUTCDate(Math.min(day, lastDay)); date.setUTCDate(date.getUTCDate() + app.program.gracePeriodDays);
          return date;
        };
        await tx.borrowerLoan.create({ data: {
          borrowerId: app.borrowerId, programId: app.programId, applicationId: app.id,
          amount, interestRate: app.program.interestRate, totalRepayable: total, trancheCount,
          status: "PENDING", endDate: dueDate(months), nextPaymentDate: dueDate(1),
          disbursements: { create: Array.from({ length: trancheCount }, (_, i) => ({ trancheNumber: i + 1, amount: i === trancheCount - 1 ? amount.minus(trancheAmount.mul(trancheCount - 1)) : trancheAmount })) },
          repayments: { create: Array.from({ length: months }, (_, i) => ({ amount: i === months - 1 ? total.minus(monthly.mul(months - 1)) : monthly, dueDate: dueDate(i + 1) })) },
        } });
      }
      return updated;
    });
  }

  static async markUnderReview(applicationId: string, lenderOrgId: string) {
    if (!lenderOrgId) throw ApiError.forbidden("Lender access required");
    const changed = await prisma.application.updateMany({ where: { id: applicationId, program: { lenderOrgId }, status: "SUBMITTED" }, data: { status: "UNDER_REVIEW" } });
    if (!changed.count) throw ApiError.notFound("Submitted application not found");
    return prisma.application.findUniqueOrThrow({ where: { id: applicationId } });
  }

  static async listForBorrower(userId: string, query: BorrowerApplicationFilters) {
    const borrower = await prisma.borrowerProfile.findUnique({ where: { userId } });
    if (!borrower) throw ApiError.notFound("Borrower profile not found");

    const { page, limit, skip } = getPagination(query);
    const where: Prisma.ApplicationWhereInput = { borrowerId: borrower.id };
    if (query.status) where.status = query.status;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: { program: { select: { name: true, lenderOrg: { select: { name: true } } } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return paginatedResponse(applications, total, page, limit);
  }

  static async listForLender(lenderOrgId: string, query: LenderApplicationFilters) {
    const { page, limit, skip } = getPagination(query);
    const where: Prisma.ApplicationWhereInput = { program: { lenderOrgId }, status: { not: "DRAFT" } };
    if (!lenderOrgId) throw ApiError.forbidden("Lender access required");
    if (query.status === "DRAFT") return paginatedResponse([], 0, page, limit);
    if (query.status) where.status = query.status;
    if (query.programId) where.programId = query.programId;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          borrower: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
          program: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return paginatedResponse(applications, total, page, limit);
  }

  static async getById(id: string, user: AuthenticatedUser) {
    const scope: Prisma.ApplicationWhereInput = user.role === "BORROWER"
      ? { borrower: { userId: user.sub } }
      : user.lenderId ? { program: { lenderOrgId: user.lenderId }, status: { not: "DRAFT" } } : { id: "__denied__" };
    const app = await prisma.application.findFirst({
      where: { id, ...scope },
      include: {
        borrower: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          },
        },
        program: { select: { name: true, lenderOrg: { select: { name: true } } } },
        documents: true,
        loans: { select: { id: true, status: true } },
      },
    });
    if (!app) throw ApiError.notFound("Application not found");
    return app;
  }

}
