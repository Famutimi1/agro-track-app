import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { logger } from "../config/logger";

interface DateRange {
  startDate: Date;
  endDate: Date;
}

export class ReportService {
  // Lender Portfolio Report
  static async getLenderPortfolioReport(lenderOrgId: string, range: DateRange) {
    const { startDate, endDate } = range;

    const [
      totalLoans,
      activeLoans,
      disbursements,
      repayments,
      applications,
      borrowers,
    ] = await Promise.all([
      prisma.borrowerLoan.aggregate({
        where: { program: { lenderOrgId }, createdAt: { gte: startDate, lte: endDate } },
        _sum: { amount: true, totalRepayable: true, amountPaid: true },
        _count: true,
      }),
      prisma.borrowerLoan.count({
        where: { program: { lenderOrgId }, status: "ACTIVE" },
      }),
      prisma.disbursement.aggregate({
        where: {
          loan: { program: { lenderOrgId } },
          status: "COMPLETED",
          processedAt: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.repayment.aggregate({
        where: {
          loan: { program: { lenderOrgId } },
          status: "PAID",
          paidAt: { gte: startDate, lte: endDate },
        },
        _sum: { paidAmount: true },
        _count: true,
      }),
      prisma.application.groupBy({
        by: ["status"],
        where: { program: { lenderOrgId }, createdAt: { gte: startDate, lte: endDate } },
        _count: true,
      }),
      prisma.borrowerProfile.count({
        where: { loans: { some: { program: { lenderOrgId } } } },
      }),
    ]);

    const totalDisbursed = Number(disbursements._sum.amount || 0);
    const totalRepaid = Number(repayments._sum.paidAmount || 0);
    const totalOutstanding = Number(totalLoans._sum.totalRepayable || 0) - Number(totalLoans._sum.amountPaid || 0);

    return {
      period: { startDate, endDate },
      portfolio: {
        totalLoans: totalLoans._count,
        activeLoans,
        totalDisbursed,
        totalRepaid,
        totalOutstanding,
        repaymentRate: totalDisbursed > 0 ? Math.round((totalRepaid / totalDisbursed) * 100 * 10) / 10 : 0,
      },
      disbursements: {
        count: disbursements._count,
        amount: totalDisbursed,
      },
      repayments: {
        count: repayments._count,
        amount: totalRepaid,
      },
      applications: applications.reduce((acc, a) => {
        acc[a.status] = a._count;
        return acc;
      }, {} as Record<string, number>),
      borrowers: {
        total: borrowers,
      },
    };
  }

  // Program Performance Report
  static async getProgramReport(programId: string, range: DateRange) {
    const { startDate, endDate } = range;

    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: { lenderOrg: { select: { name: true } } },
    });

    if (!program) throw ApiError.notFound("Program not found");

    const [loans, applications, borrowerStats] = await Promise.all([
      prisma.borrowerLoan.findMany({
        where: { programId, createdAt: { gte: startDate, lte: endDate } },
        include: {
          repayments: { where: { status: "PAID" } },
          disbursements: { where: { status: "COMPLETED" } },
        },
      }),
      prisma.application.groupBy({
        by: ["status"],
        where: { programId, createdAt: { gte: startDate, lte: endDate } },
        _count: true,
      }),
      prisma.borrowerProfile.aggregate({
        where: { loans: { some: { programId } } },
        _avg: { farmScore: true },
        _count: true,
      }),
    ]);

    const totalDisbursed = loans.reduce(
      (sum, l) => sum + l.disbursements.reduce((s, d) => s + Number(d.amount), 0),
      0
    );
    const totalRepaid = loans.reduce(
      (sum, l) => sum + l.repayments.reduce((s, r) => s + Number(r.paidAmount || 0), 0),
      0
    );

    const statusBreakdown = loans.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      program: {
        id: program.id,
        name: program.name,
        lender: program.lenderOrg.name,
        interestRate: program.interestRate,
        maxAmount: Number(program.maxAmount),
        minAmount: Number(program.minAmount),
      },
      period: { startDate, endDate },
      loans: {
        count: loans.length,
        statusBreakdown,
        totalDisbursed,
        totalRepaid,
        repaymentRate: totalDisbursed > 0 ? Math.round((totalRepaid / totalDisbursed) * 100 * 10) / 10 : 0,
      },
      applications: applications.reduce((acc, a) => {
        acc[a.status] = a._count;
        return acc;
      }, {} as Record<string, number>),
      borrowers: {
        count: borrowerStats._count,
        avgFarmScore: Math.round(borrowerStats._avg.farmScore || 0),
      },
    };
  }

  // Borrower Statement
  static async getBorrowerStatement(borrowerId: string, range: DateRange, lenderOrgId: string) {
    const { startDate, endDate } = range;

    const borrower = await prisma.borrowerProfile.findUnique({
      where: { id: borrowerId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        cooperative: { select: { name: true } },
      },
    });

    if (!borrower) throw ApiError.notFound("Borrower not found");

    const loans = await prisma.borrowerLoan.findMany({
      where: { borrowerId, program: { lenderOrgId } },
      include: {
        program: { select: { name: true, lenderOrg: { select: { name: true } } } },
        disbursements: {
          where: { status: "COMPLETED", processedAt: { gte: startDate, lte: endDate } },
          orderBy: { processedAt: "asc" },
        },
        repayments: {
          where: { paidAt: { gte: startDate, lte: endDate } },
          orderBy: { paidAt: "asc" },
        },
      },
    });

    const transactions = loans.flatMap((loan) => [
      ...loan.disbursements.map((d) => ({
        date: d.processedAt!,
        type: "DISBURSEMENT" as const,
        description: `Disbursement - ${loan.program.name} (Tranche ${d.trancheNumber})`,
        credit: Number(d.amount),
        debit: 0,
        balance: 0,
      })),
      ...loan.repayments
        .filter((r) => r.status === "PAID")
        .map((r) => ({
          date: r.paidAt!,
          type: "REPAYMENT" as const,
          description: `Repayment - ${loan.program.name}`,
          credit: 0,
          debit: Number(r.paidAmount || 0),
          balance: 0,
        })),
    ]).sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate running balance
    let balance = 0;
    for (const tx of transactions) {
      balance += tx.credit - tx.debit;
      tx.balance = balance;
    }

    const totalDisbursed = transactions.reduce((s, t) => s + t.credit, 0);
    const totalRepaid = transactions.reduce((s, t) => s + t.debit, 0);

    return {
      borrower: {
        id: borrower.id,
        farmerId: borrower.farmerId,
        name: `${borrower.user.firstName} ${borrower.user.lastName}`,
        phone: borrower.user.phone,
        state: borrower.state,
        lga: borrower.lga,
        farmScore: borrower.farmScore,
        cooperative: borrower.cooperative?.name,
      },
      period: { startDate, endDate },
      summary: {
        totalDisbursed,
        totalRepaid,
        outstandingBalance: balance,
      },
      transactions,
    };
  }

  // Admin Platform Report
  static async getPlatformReport(range: DateRange) {
    const { startDate, endDate } = range;

    const [
      lenders,
      borrowers,
      loans,
      disbursements,
      repayments,
      applications,
    ] = await Promise.all([
      prisma.lenderOrganization.count(),
      prisma.borrowerProfile.count(),
      prisma.borrowerLoan.aggregate({
        where: { createdAt: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.disbursement.aggregate({
        where: { status: "COMPLETED", processedAt: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
      prisma.repayment.aggregate({
        where: { status: "PAID", paidAt: { gte: startDate, lte: endDate } },
        _sum: { paidAmount: true },
      }),
      prisma.application.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
    ]);

    const stateBreakdown = await prisma.borrowerProfile.groupBy({
      by: ["state"],
      _count: true,
      orderBy: { _count: { state: "desc" } },
      take: 10,
    });

    return {
      period: { startDate, endDate },
      overview: {
        totalLenders: lenders,
        totalBorrowers: borrowers,
        newLoans: loans._count,
        totalLoanValue: Number(loans._sum.amount || 0),
        totalDisbursed: Number(disbursements._sum.amount || 0),
        totalRepaid: Number(repayments._sum.paidAmount || 0),
        applications,
      },
      geographic: {
        topStates: stateBreakdown.map((s) => ({
          state: s.state,
          borrowers: s._count,
        })),
      },
    };
  }

  // Overdue Report
  static async getOverdueReport(lenderOrgId: string) {
    const today = new Date();

    const overdueRepayments = await prisma.repayment.findMany({
      where: {
        loan: { program: { lenderOrgId } },
        status: { in: ["PENDING", "PARTIAL"] },
        dueDate: { lt: today },
      },
      include: {
        loan: {
          include: {
            borrower: {
              include: { user: { select: { firstName: true, lastName: true, phone: true } } },
            },
            program: { select: { name: true } },
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    const grouped = overdueRepayments.reduce((acc, r) => {
      const daysOverdue = Math.floor((today.getTime() - r.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const bracket =
        daysOverdue <= 30 ? "1-30 days" :
        daysOverdue <= 60 ? "31-60 days" :
        daysOverdue <= 90 ? "61-90 days" : "90+ days";

      if (!acc[bracket]) acc[bracket] = [];
      acc[bracket].push({
        borrower: {
          name: `${r.loan.borrower.user.firstName} ${r.loan.borrower.user.lastName}`,
          phone: r.loan.borrower.user.phone,
          farmerId: r.loan.borrower.farmerId,
        },
        program: r.loan.program.name,
        amount: Number(r.amount),
        dueDate: r.dueDate,
        daysOverdue,
      });

      return acc;
    }, {} as Record<string, any[]>);

    const totalOverdue = overdueRepayments.reduce((s, r) => s + Number(r.amount), 0);

    return {
      summary: {
        totalOverdueCount: overdueRepayments.length,
        totalOverdueAmount: totalOverdue,
      },
      byAgeBracket: grouped,
    };
  }
}
