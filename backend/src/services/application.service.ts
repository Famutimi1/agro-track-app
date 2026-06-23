import { ApplicationStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
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
    const borrower = await prisma.borrowerProfile.findUnique({ where: { userId } });
    if (!borrower) throw ApiError.notFound("Borrower profile not found");

    const program = await prisma.program.findUnique({ where: { id: data.programId } });
    if (!program) throw ApiError.notFound("Program not found");
    if (program.status !== "ACTIVE") throw ApiError.badRequest("Program is not accepting applications");

    if (data.amount < Number(program.minAmount) || data.amount > Number(program.maxAmount)) {
      throw ApiError.badRequest(`Amount must be between ₦${program.minAmount} and ₦${program.maxAmount}`);
    }

    if (program.requiredScore > 0 && borrower.farmScore < program.requiredScore) {
      throw ApiError.badRequest(`Minimum FarmScore of ${program.requiredScore} required. Your score: ${borrower.farmScore}`);
    }

    const existing = await prisma.application.findFirst({
      where: {
        borrowerId: borrower.id,
        programId: data.programId,
        status: { in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW"] },
      },
    });
    if (existing) throw ApiError.conflict("You already have a pending application for this program");

    return prisma.application.create({
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
  }

  static async submit(userId: string, applicationId: string) {
    const app = await this.getByIdForBorrower(userId, applicationId);
    if (app.status !== "DRAFT") throw ApiError.badRequest("Only draft applications can be submitted");

    return prisma.application.update({
      where: { id: applicationId },
      data: { status: "SUBMITTED", submittedAt: new Date() },
      include: { program: { select: { name: true } } },
    });
  }

  static async withdraw(userId: string, applicationId: string) {
    const app = await this.getByIdForBorrower(userId, applicationId);
    if (!["DRAFT", "SUBMITTED", "UNDER_REVIEW"].includes(app.status)) {
      throw ApiError.badRequest("Cannot withdraw application in current status");
    }

    return prisma.application.update({
      where: { id: applicationId },
      data: { status: "WITHDRAWN" },
    });
  }

  static async review(
    reviewerId: string,
    applicationId: string,
    data: { status: "APPROVED" | "REJECTED"; rejectionReason?: string; notes?: string }
  ) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { program: true, borrower: true },
    });
    if (!app) throw ApiError.notFound("Application not found");
    if (!["SUBMITTED", "UNDER_REVIEW"].includes(app.status)) {
      throw ApiError.badRequest("Application is not in a reviewable state");
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: data.status,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        rejectionReason: data.rejectionReason,
        notes: data.notes,
      },
      include: { borrower: { include: { user: { select: { firstName: true, lastName: true } } } }, program: { select: { name: true } } },
    });

    if (data.status === "APPROVED") {
      await prisma.borrowerLoan.create({
        data: {
          borrowerId: app.borrowerId,
          programId: app.programId,
          applicationId: app.id,
          amount: app.amount,
          interestRate: app.program.interestRate,
          totalRepayable: Number(app.amount) * (1 + app.program.interestRate / 100),
          trancheCount: app.program.trancheCount,
          status: "PENDING",
        },
      });
    }

    return updated;
  }

  static async markUnderReview(applicationId: string) {
    return prisma.application.update({
      where: { id: applicationId },
      data: { status: "UNDER_REVIEW" },
    });
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
    const where: Prisma.ApplicationWhereInput = { program: { lenderOrgId } };
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

  static async getById(id: string) {
    const app = await prisma.application.findUnique({
      where: { id },
      include: {
        borrower: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          },
        },
        program: { select: { name: true, lenderOrg: { select: { name: true } } } },
        documents: true,
      },
    });
    if (!app) throw ApiError.notFound("Application not found");
    return app;
  }

  private static async getByIdForBorrower(userId: string, applicationId: string) {
    const borrower = await prisma.borrowerProfile.findUnique({ where: { userId } });
    if (!borrower) throw ApiError.notFound("Borrower profile not found");

    const app = await prisma.application.findFirst({
      where: { id: applicationId, borrowerId: borrower.id },
    });
    if (!app) throw ApiError.notFound("Application not found");
    return app;
  }
}
