import { ApplicationStatus, DocumentType, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { DocumentService } from "./document.service";
import { getPagination, paginatedResponse, PaginationQuery } from "../utils/pagination";

interface BorrowerApplicationFilters extends PaginationQuery {
  status?: ApplicationStatus;
}

interface LenderApplicationFilters extends PaginationQuery {
  status?: ApplicationStatus;
  programId?: string;
  state?: string;
  minFarmScore?: number;
  maxFarmScore?: number;
  agentVerified?: string;
  sortBy?: "newest" | "oldest" | "highestScore" | "highestAmount";
  search?: string;
}

export interface ApproveData {
  reviewNotes?: string;
  approvedAmount?: number;
}

export interface RejectData {
  reason: string;
  rejectionCode: string;
}

export interface RequestInfoData {
  requiredItems: string[];
  message: string;
}

export interface BulkActionData {
  applicationIds: string[];
  action: "APPROVE" | "REJECT" | "ASSIGN";
  rejectionCode?: string;
  rejectionReason?: string;
  assigneeId?: string;
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

  static async checkEligibility(userId: string, programId: string, amount?: number) {
    const borrower = await prisma.borrowerProfile.findUnique({ where: { userId } });
    if (!borrower) throw ApiError.notFound("Borrower profile not found");

    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) throw ApiError.notFound("Program not found");

    const checks: { key: string; label: string; pass: boolean; detail: string }[] = [];

    checks.push({
      key: "programActive",
      label: "Program accepting applications",
      pass: program.status === "ACTIVE",
      detail:
        program.status === "ACTIVE"
          ? "This program is currently open for applications."
          : "This program is not currently accepting applications.",
    });

    if (amount !== undefined) {
      const amountOk = amount >= Number(program.minAmount) && amount <= Number(program.maxAmount);
      checks.push({
        key: "amountRange",
        label: "Amount within program limits",
        pass: amountOk,
        detail: amountOk
          ? `₦${amount.toLocaleString()} is within the ₦${Number(program.minAmount).toLocaleString()} - ₦${Number(program.maxAmount).toLocaleString()} range.`
          : `Amount must be between ₦${Number(program.minAmount).toLocaleString()} and ₦${Number(program.maxAmount).toLocaleString()}.`,
      });
    } else {
      checks.push({
        key: "amountRange",
        label: "Amount within program limits",
        pass: true,
        detail: `Program accepts ₦${Number(program.minAmount).toLocaleString()} - ₦${Number(program.maxAmount).toLocaleString()}.`,
      });
    }

    const farmScoreOk = program.requiredScore === 0 || borrower.farmScore >= program.requiredScore;
    checks.push({
      key: "farmScore",
      label: "FarmScore requirement",
      pass: farmScoreOk,
      detail: farmScoreOk
        ? `Your FarmScore (${borrower.farmScore}) meets the minimum requirement (${program.requiredScore}).`
        : `Minimum FarmScore of ${program.requiredScore} required. Your score: ${borrower.farmScore}.`,
    });

    const existing = await prisma.application.findFirst({
      where: {
        borrowerId: borrower.id,
        programId,
        status: { in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW"] },
      },
    });
    checks.push({
      key: "noDuplicateApplication",
      label: "No pending application for this program",
      pass: !existing,
      detail: existing
        ? "You already have a pending application for this program."
        : "You have no pending applications for this program.",
    });

    return { eligible: checks.every((c) => c.pass), checks };
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

  static async uploadDocuments(
    userId: string,
    applicationId: string,
    files: { buffer: Buffer; mimeType: string; originalName: string; type?: DocumentType }[]
  ) {
    const borrower = await prisma.borrowerProfile.findUnique({ where: { userId } });
    if (!borrower) throw ApiError.notFound("Borrower profile not found");

    const app = await prisma.application.findFirst({
      where: { id: applicationId, borrowerId: borrower.id },
    });
    if (!app) throw ApiError.notFound("Application not found");
    if (["APPROVED", "REJECTED", "WITHDRAWN"].includes(app.status)) {
      throw ApiError.badRequest("Cannot upload documents for a finalized application");
    }

    const documents = await Promise.all(
      files.map((file) =>
        DocumentService.upload({
          borrowerId: borrower.id,
          applicationId,
          type: file.type ?? "OTHER",
          buffer: file.buffer,
          mimeType: file.mimeType,
          originalName: file.originalName,
        })
      )
    );

    return documents;
  }

  static async respondToInfoRequest(
    userId: string,
    applicationId: string,
    data: { message?: string }
  ) {
    const app = await this.getByIdForBorrower(userId, applicationId);
    if (app.status !== "UNDER_REVIEW") {
      throw ApiError.badRequest("This application is not awaiting additional information");
    }

    const responseNote = `[INFO_PROVIDED]${data.message ? ` ${data.message}` : ""}`;
    const notes = app.notes ? `${app.notes}\n${responseNote}` : responseNote;

    return prisma.application.update({
      where: { id: applicationId },
      data: { notes },
      include: { program: { select: { name: true } } },
    });
  }

  static async approve(reviewerId: string, applicationId: string, data: ApproveData) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        program: true,
        borrower: {
          include: { user: { select: { firstName: true, lastName: true, phone: true } } }
        }
      },
    });
    if (!app) throw ApiError.notFound("Application not found");
    if (!["SUBMITTED", "UNDER_REVIEW"].includes(app.status)) {
      throw ApiError.badRequest("Application is not in a reviewable state");
    }

    const approvedAmount = data.approvedAmount || Number(app.amount);

    // Validate approved amount is within program limits
    if (approvedAmount < Number(app.program.minAmount) || approvedAmount > Number(app.program.maxAmount)) {
      throw ApiError.badRequest(`Approved amount must be between ₦${app.program.minAmount} and ₦${app.program.maxAmount}`);
    }

    // Create loan and first disbursement in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update application status
      const updated = await tx.application.update({
        where: { id: applicationId },
        data: {
          status: "APPROVED",
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          notes: data.reviewNotes,
          amount: approvedAmount, // Update to approved amount if different
        },
        include: {
          borrower: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } } },
          program: { select: { name: true } },
        },
      });

      // Calculate loan details
      const interestRate = app.program.interestRate;
      const totalRepayable = approvedAmount * (1 + interestRate / 100);
      const gracePeriodDays = app.program.gracePeriodDays;

      // Calculate start and end dates
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + gracePeriodDays);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + app.program.durationMonths);

      // Create loan
      const loan = await tx.borrowerLoan.create({
        data: {
          borrowerId: app.borrowerId,
          programId: app.programId,
          applicationId: app.id,
          amount: approvedAmount,
          interestRate,
          totalRepayable,
          trancheCount: app.program.trancheCount,
          currentTranche: 0,
          status: "PENDING",
          startDate,
          endDate,
        },
      });

      // Create first disbursement (Layer 1)
      const firstTranchePercent = app.program.trancheCount > 1 ? 0.3 : 1.0; // 30% for layered, 100% for full
      const firstTrancheAmount = approvedAmount * firstTranchePercent;

      await tx.disbursement.create({
        data: {
          loanId: loan.id,
          trancheNumber: 1,
          amount: firstTrancheAmount,
          status: "PENDING",
        },
      });

      // Create repayment schedule
      const monthlyAmount = totalRepayable / app.program.durationMonths;
      const repaymentPromises = [];

      for (let i = 0; i < app.program.durationMonths; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i + 1);

        repaymentPromises.push(
          tx.repayment.create({
            data: {
              loanId: loan.id,
              amount: monthlyAmount,
              dueDate,
              status: "PENDING",
            },
          })
        );
      }

      await Promise.all(repaymentPromises);

      // Update borrower FarmScore (+5 for first loan approval)
      await tx.borrowerProfile.update({
        where: { id: app.borrowerId },
        data: { farmScore: { increment: 5 } },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: reviewerId,
          action: "APPLICATION_APPROVED",
          resource: "Application",
          resourceId: applicationId,
          details: {
            approvedAmount,
            loanId: loan.id,
            reviewNotes: data.reviewNotes,
          },
        },
      });

      return { application: updated, loan };
    });

    // TODO: Send SMS notification to borrower
    // TODO: Send WhatsApp notification if opted in

    return result.application;
  }

  static async reject(reviewerId: string, applicationId: string, data: RejectData) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { borrower: { include: { user: true } }, program: true },
    });
    if (!app) throw ApiError.notFound("Application not found");
    if (!["SUBMITTED", "UNDER_REVIEW"].includes(app.status)) {
      throw ApiError.badRequest("Application is not in a reviewable state");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id: applicationId },
        data: {
          status: "REJECTED",
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          rejectionReason: `[${data.rejectionCode}] ${data.reason}`,
        },
        include: {
          borrower: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
          program: { select: { name: true } },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: reviewerId,
          action: "APPLICATION_REJECTED",
          resource: "Application",
          resourceId: applicationId,
          details: {
            rejectionCode: data.rejectionCode,
            reason: data.reason,
          },
        },
      });

      return updated;
    });

    // TODO: Send SMS notification to borrower with rejection reason

    return result;
  }

  static async requestInfo(reviewerId: string, applicationId: string, data: RequestInfoData) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { borrower: { include: { user: true } } },
    });
    if (!app) throw ApiError.notFound("Application not found");
    if (!["SUBMITTED", "UNDER_REVIEW"].includes(app.status)) {
      throw ApiError.badRequest("Application is not in a reviewable state");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id: applicationId },
        data: {
          status: "UNDER_REVIEW",
          notes: `[INFO_REQUESTED] ${data.requiredItems.join(", ")}\nMessage: ${data.message}`,
        },
        include: {
          borrower: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
          program: { select: { name: true } },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: reviewerId,
          action: "APPLICATION_INFO_REQUESTED",
          resource: "Application",
          resourceId: applicationId,
          details: {
            requiredItems: data.requiredItems,
            message: data.message,
          },
        },
      });

      return updated;
    });

    // TODO: Send SMS/WhatsApp notification to borrower with required items list

    return result;
  }

  static async bulkAction(reviewerId: string, lenderOrgId: string, data: BulkActionData) {
    // Verify all applications belong to this lender
    const apps = await prisma.application.findMany({
      where: {
        id: { in: data.applicationIds },
        program: { lenderOrgId },
        status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
      },
    });

    if (apps.length !== data.applicationIds.length) {
      throw ApiError.badRequest("Some applications were not found or are not in a reviewable state");
    }

    const results = {
      successful: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    for (const app of apps) {
      try {
        switch (data.action) {
          case "APPROVE":
            await this.approve(reviewerId, app.id, {});
            results.successful.push(app.id);
            break;
          case "REJECT":
            if (!data.rejectionCode) throw new Error("Rejection code required");
            await this.reject(reviewerId, app.id, {
              reason: data.rejectionReason || "Bulk rejection",
              rejectionCode: data.rejectionCode,
            });
            results.successful.push(app.id);
            break;
          case "ASSIGN":
            // TODO: Implement assign to reviewer
            results.successful.push(app.id);
            break;
        }
      } catch (err) {
        results.failed.push({
          id: app.id,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return results;
  }

  // Legacy review method (kept for backward compatibility)
  static async review(
    reviewerId: string,
    applicationId: string,
    data: { status: "APPROVED" | "REJECTED"; rejectionReason?: string; notes?: string }
  ) {
    if (data.status === "APPROVED") {
      return this.approve(reviewerId, applicationId, { reviewNotes: data.notes });
    } else {
      return this.reject(reviewerId, applicationId, {
        reason: data.rejectionReason || "Application rejected",
        rejectionCode: "OTHER",
      });
    }
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

    // Apply filters
    if (query.status) where.status = query.status;
    if (query.programId) where.programId = query.programId;
    if (query.state) where.borrower = { ...where.borrower as object, state: query.state };

    if (query.minFarmScore || query.maxFarmScore) {
      where.farmScoreAtApply = {};
      if (query.minFarmScore) where.farmScoreAtApply.gte = query.minFarmScore;
      if (query.maxFarmScore) where.farmScoreAtApply.lte = query.maxFarmScore;
    }

    if (query.search) {
      where.OR = [
        { borrower: { user: { firstName: { contains: query.search, mode: "insensitive" } } } },
        { borrower: { user: { lastName: { contains: query.search, mode: "insensitive" } } } },
        { borrower: { farmerId: { contains: query.search, mode: "insensitive" } } },
      ];
    }

    // Determine sort order
    let orderBy: Prisma.ApplicationOrderByWithRelationInput = { createdAt: "desc" };
    switch (query.sortBy) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "highestScore":
        orderBy = { farmScoreAtApply: "desc" };
        break;
      case "highestAmount":
        orderBy = { amount: "desc" };
        break;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          borrower: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true } },
            }
          },
          program: { select: { name: true } },
          documents: { select: { id: true, type: true, status: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    // Calculate days in queue for each application
    const enrichedApplications = applications.map((app) => ({
      ...app,
      daysInQueue: app.submittedAt
        ? Math.floor((Date.now() - app.submittedAt.getTime()) / (1000 * 60 * 60 * 24))
        : null,
    }));

    return paginatedResponse(enrichedApplications, total, page, limit);
  }

  static async getById(id: string) {
    const app = await prisma.application.findUnique({
      where: { id },
      include: {
        borrower: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
            cooperative: { select: { name: true, id: true } },
            scoreHistory: { orderBy: { calculatedAt: "desc" }, take: 6 },
          },
        },
        program: {
          select: {
            name: true,
            lenderOrg: { select: { name: true } },
            requiredDocuments: true,
            interestRate: true,
            durationMonths: true,
            trancheCount: true,
            disbursementType: true,
          }
        },
        documents: true,
      },
    });
    if (!app) throw ApiError.notFound("Application not found");

    // Calculate days in queue
    const daysInQueue = app.submittedAt
      ? Math.floor((Date.now() - app.submittedAt.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return { ...app, daysInQueue };
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
