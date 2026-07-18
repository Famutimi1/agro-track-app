import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { logger } from "../config/logger";

interface DateRange {
  startDate: Date;
  endDate: Date;
}

export type ReportType =
  | "PORTFOLIO_PERFORMANCE"
  | "STATE_BREAKDOWN"
  | "CROP_ANALYSIS"
  | "GENDER_DEMOGRAPHICS"
  | "DEFAULT_RISK"
  | "IMPACT_REPORT"
  | "FIELD_AGENT_ACTIVITY"
  | "AUDIT_EXPORT";

interface ReportJob {
  id: string;
  type: ReportType;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  progress: number;
  downloadUrl?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

const reportJobs = new Map<string, ReportJob>();

export class ReportService {
  static async getImpactMetrics(lenderOrgId: string) {
    const [
      farmersFunded,
      totalHectares,
      totalDisbursed,
      fundUtilization,
    ] = await Promise.all([
      prisma.borrowerProfile.count({
        where: { loans: { some: { program: { lenderOrgId }, status: { in: ["ACTIVE", "COMPLETED"] } } } },
      }),
      prisma.borrowerProfile.aggregate({
        where: { loans: { some: { program: { lenderOrgId } } } },
        _sum: { farmSizeHa: true },
      }),
      prisma.disbursement.aggregate({
        where: { loan: { program: { lenderOrgId } }, status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.program.aggregate({
        where: { lenderOrgId, status: "ACTIVE" },
        _sum: { totalFund: true },
      }),
    ]);

    const hectares = totalHectares._sum.farmSizeHa || 0;
    const disbursed = Number(totalDisbursed._sum.amount || 0);
    const totalFund = Number(fundUtilization._sum.totalFund || 0);

    return {
      farmersFunded,
      hectaresFarmed: Math.round(hectares),
      jobsCreated: Math.round(hectares * 2.5),
      estimatedYieldTonnes: Math.round(hectares * 3),
      fundUtilizationRate: totalFund > 0 ? Math.round((disbursed / totalFund) * 100) : 0,
    };
  }

  static async generateReport(
    lenderOrgId: string,
    type: ReportType,
    options: {
      dateFrom?: string;
      dateTo?: string;
      format?: "PDF" | "CSV" | "XLSX";
      filters?: Record<string, any>;
    },
    userId: string
  ) {
    const jobId = `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const job: ReportJob = {
      id: jobId,
      type,
      status: "PENDING",
      progress: 0,
      createdAt: new Date(),
    };

    reportJobs.set(jobId, job);

    this.processReport(jobId, lenderOrgId, type, options, userId);

    logger.info("Report generation started", { jobId, type, lenderOrgId });

    return { jobId };
  }

  private static async processReport(
    jobId: string,
    lenderOrgId: string,
    type: ReportType,
    options: any,
    userId: string
  ) {
    const job = reportJobs.get(jobId);
    if (!job) return;

    try {
      job.status = "PROCESSING";
      job.progress = 10;

      const dateFrom = options.dateFrom ? new Date(options.dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const dateTo = options.dateTo ? new Date(options.dateTo) : new Date();

      let reportData: any;

      switch (type) {
        case "PORTFOLIO_PERFORMANCE":
          job.progress = 30;
          reportData = await this.getLenderPortfolioReport(lenderOrgId, { startDate: dateFrom, endDate: dateTo });
          break;
        case "STATE_BREAKDOWN":
          job.progress = 30;
          reportData = await this.getStateBreakdownReport(lenderOrgId, { startDate: dateFrom, endDate: dateTo });
          break;
        case "CROP_ANALYSIS":
          job.progress = 30;
          reportData = await this.getCropAnalysisReport(lenderOrgId, { startDate: dateFrom, endDate: dateTo });
          break;
        case "GENDER_DEMOGRAPHICS":
          job.progress = 30;
          reportData = await this.getGenderDemographicsReport(lenderOrgId);
          break;
        case "DEFAULT_RISK":
          job.progress = 30;
          reportData = await this.getOverdueReport(lenderOrgId);
          break;
        case "IMPACT_REPORT":
          job.progress = 30;
          reportData = await this.getImpactReport(lenderOrgId, { startDate: dateFrom, endDate: dateTo });
          break;
        case "FIELD_AGENT_ACTIVITY":
          job.progress = 30;
          reportData = await this.getFieldAgentActivityReport(lenderOrgId, { startDate: dateFrom, endDate: dateTo });
          break;
        case "AUDIT_EXPORT":
          job.progress = 30;
          reportData = await this.getAuditExport(lenderOrgId, { startDate: dateFrom, endDate: dateTo });
          break;
        default:
          throw new Error(`Unknown report type: ${type}`);
      }

      job.progress = 80;

      job.downloadUrl = `/api/v1/reports/download/${jobId}`;
      job.status = "COMPLETED";
      job.progress = 100;
      job.completedAt = new Date();

      await prisma.auditLog.create({
        data: {
          userId,
          action: "REPORT_GENERATED",
          resource: "REPORT",
          resourceId: jobId,
          details: { type, format: options.format || "PDF" },
        },
      });

      logger.info("Report generation completed", { jobId, type });
    } catch (error: any) {
      job.status = "FAILED";
      job.error = error.message;
      logger.error("Report generation failed", { jobId, type, error: error.message });
    }
  }

  static getJobStatus(jobId: string): ReportJob | null {
    return reportJobs.get(jobId) || null;
  }

  static async getLenderPortfolioReport(lenderOrgId: string, range: DateRange) {
    const { startDate, endDate } = range;

    const [
      totalLoans,
      activeLoans,
      disbursements,
      repayments,
      applications,
      borrowers,
      programBreakdown,
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
      prisma.borrowerLoan.groupBy({
        by: ["programId"],
        where: { program: { lenderOrgId }, createdAt: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const programs = await prisma.program.findMany({
      where: { id: { in: programBreakdown.map((p) => p.programId) } },
      select: { id: true, name: true },
    });

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
      disbursements: { count: disbursements._count, amount: totalDisbursed },
      repayments: { count: repayments._count, amount: totalRepaid },
      applications: applications.reduce((acc, a) => {
        acc[a.status] = a._count;
        return acc;
      }, {} as Record<string, number>),
      borrowers: { total: borrowers },
      byProgram: programBreakdown.map((p) => ({
        programId: p.programId,
        programName: programs.find((pr) => pr.id === p.programId)?.name || "Unknown",
        loanCount: p._count,
        totalAmount: Number(p._sum.amount || 0),
      })),
    };
  }

  static async getStateBreakdownReport(lenderOrgId: string, range: DateRange) {
    const { startDate, endDate } = range;

    const stateData = await prisma.borrowerProfile.groupBy({
      by: ["state"],
      where: { loans: { some: { program: { lenderOrgId }, createdAt: { gte: startDate, lte: endDate } } } },
      _count: true,
    });

    const stateDetails = await Promise.all(
      stateData.map(async (s) => {
        const [loans, repayments] = await Promise.all([
          prisma.borrowerLoan.aggregate({
            where: { borrower: { state: s.state }, program: { lenderOrgId } },
            _sum: { amount: true, amountPaid: true },
            _count: true,
          }),
          prisma.repayment.aggregate({
            where: {
              loan: { borrower: { state: s.state }, program: { lenderOrgId } },
              status: "PAID",
            },
            _sum: { paidAmount: true },
          }),
        ]);

        const disbursed = Number(loans._sum.amount || 0);
        const repaid = Number(repayments._sum.paidAmount || 0);

        return {
          state: s.state,
          borrowerCount: s._count,
          loanCount: loans._count,
          totalDisbursed: disbursed,
          totalRepaid: repaid,
          repaymentRate: disbursed > 0 ? Math.round((repaid / disbursed) * 100) : 0,
        };
      })
    );

    return {
      period: { startDate, endDate },
      states: stateDetails.sort((a, b) => b.totalDisbursed - a.totalDisbursed),
    };
  }

  static async getCropAnalysisReport(lenderOrgId: string, range: DateRange) {
    const { startDate, endDate } = range;

    const cropData = await prisma.borrowerProfile.groupBy({
      by: ["primaryCrop"],
      where: { loans: { some: { program: { lenderOrgId }, createdAt: { gte: startDate, lte: endDate } } } },
      _count: true,
      _avg: { farmScore: true },
    });

    const cropDetails = await Promise.all(
      cropData.map(async (c) => {
        const loans = await prisma.borrowerLoan.aggregate({
          where: { borrower: { primaryCrop: c.primaryCrop }, program: { lenderOrgId } },
          _sum: { amount: true, amountPaid: true },
          _count: true,
        });

        const disbursed = Number(loans._sum.amount || 0);
        const repaid = Number(loans._sum.amountPaid || 0);

        return {
          crop: c.primaryCrop,
          farmerCount: c._count,
          avgFarmScore: Math.round(c._avg.farmScore || 0),
          loanCount: loans._count,
          totalDisbursed: disbursed,
          repaymentRate: disbursed > 0 ? Math.round((repaid / disbursed) * 100) : 0,
        };
      })
    );

    return {
      period: { startDate, endDate },
      crops: cropDetails.sort((a, b) => b.totalDisbursed - a.totalDisbursed),
    };
  }

  static async getGenderDemographicsReport(lenderOrgId: string) {
    const genderData = await prisma.borrowerProfile.groupBy({
      by: ["gender"],
      where: { loans: { some: { program: { lenderOrgId } } } },
      _count: true,
      _avg: { farmScore: true, farmSizeHa: true },
    });

    const genderDetails = await Promise.all(
      genderData.map(async (g) => {
        const loans = await prisma.borrowerLoan.aggregate({
          where: { borrower: { gender: g.gender }, program: { lenderOrgId } },
          _sum: { amount: true },
          _avg: { amount: true },
        });

        return {
          gender: g.gender || "Unknown",
          count: g._count,
          avgFarmScore: Math.round(g._avg.farmScore || 0),
          avgFarmSize: Math.round((g._avg.farmSizeHa || 0) * 10) / 10,
          totalLoaned: Number(loans._sum.amount || 0),
          avgLoanSize: Number(loans._avg.amount || 0),
        };
      })
    );

    const ageGroups = await prisma.$queryRaw<Array<{ ageGroup: string; count: bigint }>>`
      SELECT
        CASE
          WHEN EXTRACT(YEAR FROM AGE("dateOfBirth")) < 25 THEN 'Youth (18-24)'
          WHEN EXTRACT(YEAR FROM AGE("dateOfBirth")) < 35 THEN 'Young Adult (25-34)'
          WHEN EXTRACT(YEAR FROM AGE("dateOfBirth")) < 50 THEN 'Adult (35-49)'
          ELSE 'Senior (50+)'
        END as "ageGroup",
        COUNT(*) as count
      FROM "BorrowerProfile"
      WHERE "dateOfBirth" IS NOT NULL
      GROUP BY "ageGroup"
    `.catch(() => []);

    return {
      byGender: genderDetails,
      byAge: ageGroups.map((a) => ({ ageGroup: a.ageGroup, count: Number(a.count) })),
    };
  }

  static async getImpactReport(lenderOrgId: string, range: DateRange) {
    const { startDate, endDate } = range;

    const [farmers, loans, hectares, cooperatives] = await Promise.all([
      prisma.borrowerProfile.count({
        where: { loans: { some: { program: { lenderOrgId }, createdAt: { gte: startDate, lte: endDate } } } },
      }),
      prisma.borrowerLoan.aggregate({
        where: { program: { lenderOrgId }, createdAt: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.borrowerProfile.aggregate({
        where: { loans: { some: { program: { lenderOrgId }, createdAt: { gte: startDate, lte: endDate } } } },
        _sum: { farmSizeHa: true },
      }),
      prisma.cooperative.count({
        where: { lenderOrgId, status: "ACTIVE" },
      }),
    ]);

    const totalHectares = hectares._sum.farmSizeHa || 0;

    return {
      period: { startDate, endDate },
      impact: {
        farmersFunded: farmers,
        hectaresFarmed: Math.round(totalHectares),
        jobsCreated: Math.round(totalHectares * 2.5),
        estimatedYieldTonnes: Math.round(totalHectares * 3),
        loanCount: loans._count,
        totalDisbursed: Number(loans._sum.amount || 0),
        cooperativesSupported: cooperatives,
      },
    };
  }

  static async getFieldAgentActivityReport(lenderOrgId: string, range: DateRange) {
    const { startDate, endDate } = range;

    const agents = await prisma.fieldAgentProfile.findMany({
      include: {
        user: { select: { firstName: true, lastName: true } },
        visits: {
          where: { createdAt: { gte: startDate, lte: endDate } },
        },
      },
    });

    return {
      period: { startDate, endDate },
      agents: agents.map((a) => ({
        agentCode: a.agentCode,
        name: `${a.user.firstName} ${a.user.lastName}`,
        state: a.state,
        registrations: a.registrations,
        verifications: a.verifications,
        visitsInPeriod: a.visits.length,
        rating: a.rating,
        totalEarnings: Number(a.totalEarnings),
        active: a.active,
      })),
      summary: {
        totalAgents: agents.length,
        activeAgents: agents.filter((a) => a.active).length,
        totalVisits: agents.reduce((s, a) => s + a.visits.length, 0),
        avgRating: agents.length > 0 ? Math.round(agents.reduce((s, a) => s + a.rating, 0) / agents.length * 10) / 10 : 0,
      },
    };
  }

  static async getAuditExport(lenderOrgId: string, range: DateRange) {
    const { startDate, endDate } = range;

    const logs = await prisma.auditLog.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10000,
    });

    return {
      period: { startDate, endDate },
      totalRecords: logs.length,
      logs: logs.map((l) => ({
        id: l.id,
        timestamp: l.createdAt,
        user: l.user ? `${l.user.firstName} ${l.user.lastName}` : "System",
        userEmail: l.user?.email,
        action: l.action,
        resource: l.resource,
        resourceId: l.resourceId,
        details: l.details,
      })),
    };
  }

  static async getOverdueReport(lenderOrgId: string) {
    const today = new Date();

    const overdueRepayments = await prisma.repayment.findMany({
      where: {
        loan: { program: { lenderOrgId } },
        status: { in: ["PENDING", "PARTIAL", "LATE", "OVERDUE"] },
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

  static async getBorrowerStatement(borrowerId: string, range: DateRange) {
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
      where: { borrowerId },
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

  static async getPlatformReport(range: DateRange) {
    const { startDate, endDate } = range;

    const [lenders, borrowers, loans, disbursements, repayments, applications] = await Promise.all([
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
}
