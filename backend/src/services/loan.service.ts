import { prisma } from "../config/prisma";
import { Prisma, LoanStatus, BorrowerLoan, Disbursement, Repayment } from "@prisma/client";
import { ApiError } from "../utils/api-error";

export interface LoansQuery {
  page?: number;
  limit?: number;
  status?: string;
  programId?: string;
  state?: string;
  borrowerId?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: "newest" | "oldest" | "highestAmount" | "lowestAmount" | "nextPayment";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface LoanStats {
  totalLoans: number;
  totalDisbursed: number;
  totalRepaid: number;
  totalOutstanding: number;
  activeLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  avgRepaymentRate: number;
}

export interface RestructureRequest {
  reason: string;
  extensionMonths: number;
  newMonthlyAmount: number;
  gracePeriodMonths?: number;
}

export interface WriteOffRequest {
  reason: string;
  writeOffAmount: number;
}

type LoanWithRelations = BorrowerLoan & {
  disbursements: Disbursement[];
  repayments: Repayment[];
};

export class LoanService {
  static async listForLender(lenderOrgId: string, query: LoansQuery = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      programId,
      state,
      borrowerId,
      minAmount,
      maxAmount,
      sortBy = "newest",
      search,
      dateFrom,
      dateTo,
    } = query;

    const where: Prisma.BorrowerLoanWhereInput = {
      program: { lenderOrgId },
    };

    if (status) {
      where.status = status as LoanStatus;
    }
    if (programId) {
      where.programId = programId;
    }
    if (borrowerId) {
      where.borrowerId = borrowerId;
    }
    if (state) {
      where.borrower = { state };
    }
    if (minAmount) {
      where.amount = { ...(where.amount as object), gte: minAmount };
    }
    if (maxAmount) {
      where.amount = { ...(where.amount as object), lte: maxAmount };
    }
    if (dateFrom) {
      where.createdAt = { ...(where.createdAt as object), gte: new Date(dateFrom) };
    }
    if (dateTo) {
      where.createdAt = { ...(where.createdAt as object), lte: new Date(dateTo) };
    }
    if (search) {
      where.OR = [
        { borrower: { user: { firstName: { contains: search, mode: "insensitive" } } } },
        { borrower: { user: { lastName: { contains: search, mode: "insensitive" } } } },
        { borrower: { farmerId: { contains: search, mode: "insensitive" } } },
        { id: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: Prisma.BorrowerLoanOrderByWithRelationInput =
      sortBy === "oldest" ? { createdAt: "asc" } :
      sortBy === "highestAmount" ? { amount: "desc" } :
      sortBy === "lowestAmount" ? { amount: "asc" } :
      sortBy === "nextPayment" ? { nextPaymentDate: "asc" } :
      { createdAt: "desc" };

    const [loans, total] = await Promise.all([
      prisma.borrowerLoan.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          borrower: {
            include: {
              user: { select: { firstName: true, lastName: true, phone: true, email: true } },
            },
          },
          program: { select: { name: true, interestRate: true, durationMonths: true } },
          disbursements: { select: { status: true, amount: true, trancheNumber: true } },
          repayments: { select: { status: true, amount: true, paidAmount: true, dueDate: true } },
        },
      }),
      prisma.borrowerLoan.count({ where }),
    ]);

    const enrichedLoans = loans.map((loan) => {
      const totalDisbursed = loan.disbursements
        .filter((d) => d.status === "COMPLETED")
        .reduce((sum: number, d) => sum + Number(d.amount), 0);
      const totalRepaid = loan.repayments
        .filter((r) => r.status === "PAID")
        .reduce((sum: number, r) => sum + Number(r.paidAmount || r.amount), 0);
      const outstandingBalance = Number(loan.totalRepayable) - totalRepaid;
      const nextPayment = loan.repayments.find((r) => r.status === "PENDING" || r.status === "OVERDUE");
      const disbursementProgress = loan.trancheCount > 0
        ? loan.disbursements.filter((d) => d.status === "COMPLETED").length / loan.trancheCount
        : 0;

      return {
        ...loan,
        amount: Number(loan.amount),
        totalRepayable: Number(loan.totalRepayable),
        amountPaid: Number(loan.amountPaid),
        totalDisbursed,
        totalRepaid,
        outstandingBalance,
        disbursementProgress,
        nextPaymentDue: nextPayment?.dueDate || null,
        nextPaymentAmount: nextPayment ? Number(nextPayment.amount) : null,
        daysToNextPayment: nextPayment
          ? Math.ceil((new Date(nextPayment.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null,
      };
    });

    return {
      data: enrichedLoans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async listForBorrower(userId: string) {
    const loans = await prisma.borrowerLoan.findMany({
      where: { borrower: { userId } },
      orderBy: { createdAt: "desc" },
      include: {
        program: { select: { name: true, interestRate: true, durationMonths: true } },
        application: { select: { id: true, farmScoreAtApply: true, submittedAt: true } },
        disbursements: { select: { status: true, amount: true, trancheNumber: true } },
        repayments: { select: { status: true, amount: true, paidAmount: true, dueDate: true } },
      },
    });

    const enrichedLoans = loans.map((loan) => {
      const totalDisbursed = loan.disbursements
        .filter((d) => d.status === "COMPLETED")
        .reduce((sum: number, d) => sum + Number(d.amount), 0);
      const totalRepaid = loan.repayments
        .filter((r) => r.status === "PAID")
        .reduce((sum: number, r) => sum + Number(r.paidAmount || r.amount), 0);
      const outstandingBalance = Number(loan.totalRepayable) - totalRepaid;
      const nextPayment = loan.repayments.find((r) => r.status === "PENDING" || r.status === "OVERDUE");
      const disbursementProgress = loan.trancheCount > 0
        ? loan.disbursements.filter((d) => d.status === "COMPLETED").length / loan.trancheCount
        : 0;

      return {
        ...loan,
        amount: Number(loan.amount),
        totalRepayable: Number(loan.totalRepayable),
        amountPaid: Number(loan.amountPaid),
        totalDisbursed,
        totalRepaid,
        outstandingBalance,
        disbursementProgress,
        nextPaymentDue: nextPayment?.dueDate || null,
        nextPaymentAmount: nextPayment ? Number(nextPayment.amount) : null,
        daysToNextPayment: nextPayment
          ? Math.ceil((new Date(nextPayment.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null,
      };
    });

    return {
      data: enrichedLoans,
      pagination: {
        page: 1,
        limit: enrichedLoans.length,
        total: enrichedLoans.length,
        totalPages: 1,
      },
    };
  }

  static async borrowerOwnsLoan(loanId: string, userId: string): Promise<boolean> {
    const loan = await prisma.borrowerLoan.findFirst({
      where: { id: loanId, borrower: { userId } },
      select: { id: true },
    });
    return !!loan;
  }

  static async getById(loanId: string) {
    const loan = await prisma.borrowerLoan.findUnique({
      where: { id: loanId },
      include: {
        borrower: {
          include: {
            user: { select: { firstName: true, lastName: true, phone: true, email: true, avatarUrl: true } },
            cooperative: { select: { id: true, name: true } },
          },
        },
        program: true,
        application: { select: { id: true, farmScoreAtApply: true, submittedAt: true } },
        disbursements: { orderBy: { trancheNumber: "asc" } },
        repayments: { orderBy: { dueDate: "asc" } },
      },
    });

    if (!loan) {
      throw ApiError.notFound("Loan not found");
    }

    const totalDisbursed = loan.disbursements
      .filter((d) => d.status === "COMPLETED")
      .reduce((sum: number, d) => sum + Number(d.amount), 0);
    const totalRepaid = loan.repayments
      .filter((r) => r.status === "PAID")
      .reduce((sum: number, r) => sum + Number(r.paidAmount || r.amount), 0);

    return {
      ...loan,
      amount: Number(loan.amount),
      totalRepayable: Number(loan.totalRepayable),
      amountPaid: Number(loan.amountPaid),
      totalDisbursed,
      totalRepaid,
      outstandingBalance: Number(loan.totalRepayable) - totalRepaid,
      disbursements: loan.disbursements.map((d) => ({ ...d, amount: Number(d.amount) })),
      repayments: loan.repayments.map((r) => ({
        ...r,
        amount: Number(r.amount),
        paidAmount: r.paidAmount ? Number(r.paidAmount) : null,
        penaltyAmount: r.penaltyAmount ? Number(r.penaltyAmount) : null,
      })),
    };
  }

  static async getRepaymentSchedule(loanId: string) {
    const repayments = await prisma.repayment.findMany({
      where: { loanId },
      orderBy: { dueDate: "asc" },
    });

    return repayments.map((r, idx: number) => ({
      ...r,
      installmentNumber: idx + 1,
      amount: Number(r.amount),
      paidAmount: r.paidAmount ? Number(r.paidAmount) : null,
      penaltyAmount: r.penaltyAmount ? Number(r.penaltyAmount) : null,
      daysLate: r.status === "OVERDUE" || (r.paidAt && new Date(r.paidAt) > new Date(r.dueDate))
        ? Math.ceil((new Date(r.paidAt || Date.now()).getTime() - new Date(r.dueDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0,
    }));
  }

  static async getTimeline(loanId: string) {
    const loan = await prisma.borrowerLoan.findUnique({
      where: { id: loanId },
      include: {
        application: { select: { submittedAt: true, reviewedAt: true, reviewedBy: true } },
        disbursements: { orderBy: { createdAt: "asc" } },
        repayments: { where: { status: { in: ["PAID", "PARTIAL"] } }, orderBy: { paidAt: "asc" } },
      },
    });

    if (!loan) {
      throw ApiError.notFound("Loan not found");
    }

    const events: Array<{
      type: string;
      date: Date;
      title: string;
      description?: string;
      amount?: number;
      reference?: string;
    }> = [];

    if (loan.application?.submittedAt) {
      events.push({
        type: "APPLICATION_SUBMITTED",
        date: loan.application.submittedAt,
        title: "Application Submitted",
      });
    }

    if (loan.application?.reviewedAt) {
      events.push({
        type: "APPLICATION_APPROVED",
        date: loan.application.reviewedAt,
        title: "Application Approved",
        description: `Approved by reviewer`,
      });
    }

    events.push({
      type: "LOAN_CREATED",
      date: loan.createdAt,
      title: "Loan Created",
      amount: Number(loan.amount),
    });

    if (loan.startDate) {
      events.push({
        type: "LOAN_ACTIVATED",
        date: loan.startDate,
        title: "Loan Activated",
      });
    }

    for (const disb of loan.disbursements) {
      if (disb.status === "COMPLETED" && disb.processedAt) {
        events.push({
          type: "DISBURSEMENT",
          date: disb.processedAt,
          title: `Tranche ${disb.trancheNumber} Disbursed`,
          amount: Number(disb.amount),
          reference: disb.paymentRef || undefined,
        });
      }
    }

    for (const rep of loan.repayments) {
      if (rep.paidAt) {
        events.push({
          type: "REPAYMENT",
          date: rep.paidAt,
          title: `Payment Received`,
          amount: Number(rep.paidAmount || rep.amount),
          reference: rep.paymentRef || undefined,
        });
      }
    }

    if (loan.status === "COMPLETED" && loan.endDate) {
      events.push({
        type: "LOAN_COMPLETED",
        date: loan.endDate,
        title: "Loan Fully Repaid",
      });
    }

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async getStats(lenderOrgId: string): Promise<LoanStats> {
    const loans = await prisma.borrowerLoan.findMany({
      where: { program: { lenderOrgId } },
      include: {
        disbursements: { where: { status: "COMPLETED" } },
        repayments: { where: { status: "PAID" } },
      },
    });

    const totalLoans = loans.length;
    const activeLoans = loans.filter((l: LoanWithRelations) => l.status === "ACTIVE").length;
    const completedLoans = loans.filter((l: LoanWithRelations) => l.status === "COMPLETED").length;
    const defaultedLoans = loans.filter((l: LoanWithRelations) => l.status === "DEFAULTED").length;

    const totalDisbursed = loans.reduce(
      (sum: number, l: LoanWithRelations) => sum + l.disbursements.reduce((s: number, d: Disbursement) => s + Number(d.amount), 0),
      0
    );
    const totalRepaid = loans.reduce(
      (sum: number, l: LoanWithRelations) => sum + l.repayments.reduce((s: number, r: Repayment) => s + Number(r.paidAmount || r.amount), 0),
      0
    );
    const totalRepayable = loans.reduce((sum: number, l: LoanWithRelations) => sum + Number(l.totalRepayable), 0);
    const totalOutstanding = totalRepayable - totalRepaid;

    const avgRepaymentRate = totalRepayable > 0 ? (totalRepaid / totalRepayable) * 100 : 0;

    return {
      totalLoans,
      totalDisbursed,
      totalRepaid,
      totalOutstanding,
      activeLoans,
      completedLoans,
      defaultedLoans,
      avgRepaymentRate: Math.round(avgRepaymentRate * 100) / 100,
    };
  }

  static async restructure(reviewerId: string, loanId: string, data: RestructureRequest) {
    const loan = await prisma.borrowerLoan.findUnique({
      where: { id: loanId },
      include: { repayments: true, borrower: true },
    });

    if (!loan) {
      throw ApiError.notFound("Loan not found");
    }

    if (loan.status !== "ACTIVE" && loan.status !== "DEFAULTED") {
      throw ApiError.badRequest("Only active or defaulted loans can be restructured");
    }

    const paidAmount = loan.repayments
      .filter((r) => r.status === "PAID")
      .reduce((sum: number, r) => sum + Number(r.paidAmount || r.amount), 0);
    const remainingBalance = Number(loan.totalRepayable) - paidAmount;

    const newEndDate = new Date(loan.endDate || new Date());
    newEndDate.setMonth(newEndDate.getMonth() + data.extensionMonths);

    const newInstallmentCount = data.extensionMonths + (data.gracePeriodMonths || 0);
    const monthlyAmount = data.newMonthlyAmount;

    const result = await prisma.$transaction(async (tx) => {
      await tx.repayment.updateMany({
        where: { loanId, status: "PENDING" },
        data: { status: "PAID", paidAmount: 0 },
      });

      const newRepayments: Prisma.RepaymentCreateManyInput[] = [];
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + (data.gracePeriodMonths || 0) + 1);

      for (let i = 0; i < newInstallmentCount; i++) {
        newRepayments.push({
          loanId,
          amount: monthlyAmount,
          dueDate: new Date(dueDate),
          status: "PENDING",
        });
        dueDate.setMonth(dueDate.getMonth() + 1);
      }

      await tx.repayment.createMany({ data: newRepayments });

      const updatedLoan = await tx.borrowerLoan.update({
        where: { id: loanId },
        data: {
          status: "ACTIVE",
          endDate: newEndDate,
          totalRepayable: paidAmount + monthlyAmount * newInstallmentCount,
          nextPaymentDate: newRepayments[0]?.dueDate,
        },
        include: { repayments: { orderBy: { dueDate: "asc" } } },
      });

      await tx.auditLog.create({
        data: {
          userId: reviewerId,
          action: "RESTRUCTURE",
          resource: "LOAN",
          resourceId: loanId,
          details: {
            reason: data.reason,
            extensionMonths: data.extensionMonths,
            newMonthlyAmount: data.newMonthlyAmount,
            gracePeriodMonths: data.gracePeriodMonths,
            remainingBalance,
            newEndDate: newEndDate.toISOString(),
          },
        },
      });

      if (loan.borrower) {
        const currentScore = loan.borrower.farmScore || 500;
        await tx.farmScoreHistory.create({
          data: {
            borrowerId: loan.borrowerId,
            score: Math.max(0, currentScore - 15),
            previousScore: currentScore,
            tier: "SILVER",
            components: { restructurePenalty: -15 },
          },
        });

        await tx.borrowerProfile.update({
          where: { id: loan.borrowerId },
          data: { farmScore: { decrement: 15 } },
        });
      }

      return updatedLoan;
    });

    return result;
  }

  static async writeOff(reviewerId: string, loanId: string, data: WriteOffRequest) {
    const loan = await prisma.borrowerLoan.findUnique({
      where: { id: loanId },
      include: { borrower: true },
    });

    if (!loan) {
      throw ApiError.notFound("Loan not found");
    }

    if (loan.status === "COMPLETED" || loan.status === "CANCELLED") {
      throw ApiError.badRequest("Cannot write off a completed or cancelled loan");
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.repayment.updateMany({
        where: { loanId, status: "PENDING" },
        data: { status: "PAID", paidAmount: 0 },
      });

      const updatedLoan = await tx.borrowerLoan.update({
        where: { id: loanId },
        data: {
          status: "CANCELLED",
          endDate: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          userId: reviewerId,
          action: "WRITE_OFF",
          resource: "LOAN",
          resourceId: loanId,
          details: {
            reason: data.reason,
            writeOffAmount: data.writeOffAmount,
            loanAmount: Number(loan.amount),
            totalRepayable: Number(loan.totalRepayable),
            amountPaid: Number(loan.amountPaid),
          },
        },
      });

      if (loan.borrower) {
        const currentScore = loan.borrower.farmScore || 500;
        await tx.farmScoreHistory.create({
          data: {
            borrowerId: loan.borrowerId,
            score: Math.max(0, currentScore - 120),
            previousScore: currentScore,
            tier: "BRONZE",
            components: { writeOffPenalty: -120 },
          },
        });

        await tx.borrowerProfile.update({
          where: { id: loan.borrowerId },
          data: { farmScore: { decrement: 120 } },
        });
      }

      return updatedLoan;
    });

    return result;
  }
}
