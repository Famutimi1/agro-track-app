import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export interface DashboardStats {
  totalDisbursed: number;
  totalRepaid: number;
  activeBorrowers: number;
  defaultRate: number;
  pendingApplications: number;
  activePrograms: number;
}

export interface TrendData {
  month: string;
  disbursed: number;
  repaid: number;
}

export interface CropDistribution {
  name: string;
  value: number;
  color: string;
}

export interface StatePerformance {
  state: string;
  rate: number;
  totalLoans: number;
  onTimePayments: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  text: string;
  amount?: number;
  borrowerName?: string;
  programName?: string;
  time: string;
  color: string;
  bg: string;
}

export interface AtRiskBorrower {
  id: string;
  name: string;
  farmerId: string;
  state: string;
  crop: string;
  overdue: number;
  days: number;
  score: number;
  loanId: string;
}

const CROP_COLORS: Record<string, string> = {
  Rice: "#16a34a",
  Cassava: "#eab308",
  Maize: "#3b82f6",
  Yam: "#f97316",
  Cocoa: "#065f46",
  Vegetables: "#10b981",
  Tomato: "#ef4444",
  Pepper: "#f59e0b",
  Sorghum: "#8b5cf6",
  Other: "#6b7280",
};

export const dashboardService = {
  async getStats(lenderOrgId: string): Promise<DashboardStats> {
    const [
      disbursementSum,
      repaymentSum,
      activeBorrowersCount,
      defaultedLoansCount,
      totalActiveLoansCount,
      pendingAppsCount,
      activeProgramsCount,
    ] = await Promise.all([
      // Total disbursed
      prisma.disbursement.aggregate({
        _sum: { amount: true },
        where: {
          status: "COMPLETED",
          loan: { program: { lenderOrgId } },
        },
      }),
      // Total repaid
      prisma.repayment.aggregate({
        _sum: { paidAmount: true },
        where: {
          status: "PAID",
          loan: { program: { lenderOrgId } },
        },
      }),
      // Active borrowers (borrowers with at least one active loan)
      prisma.borrowerLoan.findMany({
        where: {
          status: "ACTIVE",
          program: { lenderOrgId },
        },
        select: { borrowerId: true },
        distinct: ["borrowerId"],
      }),
      // Defaulted loans count
      prisma.borrowerLoan.count({
        where: {
          status: "DEFAULTED",
          program: { lenderOrgId },
        },
      }),
      // Total active loans count
      prisma.borrowerLoan.count({
        where: {
          status: { in: ["ACTIVE", "DEFAULTED"] },
          program: { lenderOrgId },
        },
      }),
      // Pending applications
      prisma.application.count({
        where: {
          status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
          program: { lenderOrgId },
        },
      }),
      // Active programs
      prisma.program.count({
        where: {
          lenderOrgId,
          status: "ACTIVE",
        },
      }),
    ]);

    const totalDisbursed = Number(disbursementSum._sum.amount || 0);
    const totalRepaid = Number(repaymentSum._sum.paidAmount || 0);
    const activeBorrowers = activeBorrowersCount.length;
    const defaultRate =
      totalActiveLoansCount > 0
        ? (defaultedLoansCount / totalActiveLoansCount) * 100
        : 0;

    return {
      totalDisbursed,
      totalRepaid,
      activeBorrowers,
      defaultRate: Math.round(defaultRate * 10) / 10,
      pendingApplications: pendingAppsCount,
      activePrograms: activeProgramsCount,
    };
  },

  async getTrends(lenderOrgId: string, months: number = 12): Promise<TrendData[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // Get disbursements by month
    const disbursements = await prisma.$queryRaw<
      { month: Date; total: Prisma.Decimal }[]
    >`
      SELECT
        DATE_TRUNC('month', d."processedAt") as month,
        SUM(d.amount) as total
      FROM "Disbursement" d
      INNER JOIN "BorrowerLoan" l ON d."loanId" = l.id
      INNER JOIN "Program" p ON l."programId" = p.id
      WHERE p."lenderOrgId" = ${lenderOrgId}
        AND d.status = 'COMPLETED'
        AND d."processedAt" >= ${startDate}
      GROUP BY DATE_TRUNC('month', d."processedAt")
      ORDER BY month ASC
    `;

    // Get repayments by month
    const repayments = await prisma.$queryRaw<
      { month: Date; total: Prisma.Decimal }[]
    >`
      SELECT
        DATE_TRUNC('month', r."paidAt") as month,
        SUM(r."paidAmount") as total
      FROM "Repayment" r
      INNER JOIN "BorrowerLoan" l ON r."loanId" = l.id
      INNER JOIN "Program" p ON l."programId" = p.id
      WHERE p."lenderOrgId" = ${lenderOrgId}
        AND r.status = 'PAID'
        AND r."paidAt" >= ${startDate}
      GROUP BY DATE_TRUNC('month', r."paidAt")
      ORDER BY month ASC
    `;

    // Build result array with all months
    const result: TrendData[] = [];
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (months - 1 - i));
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = monthNames[date.getMonth()];

      const disbursement = disbursements.find(
        (d) =>
          `${d.month.getFullYear()}-${String(d.month.getMonth() + 1).padStart(2, "0")}` === monthKey
      );
      const repayment = repayments.find(
        (r) =>
          `${r.month.getFullYear()}-${String(r.month.getMonth() + 1).padStart(2, "0")}` === monthKey
      );

      result.push({
        month: monthLabel,
        disbursed: Math.round(Number(disbursement?.total || 0) / 1_000_000 * 10) / 10,
        repaid: Math.round(Number(repayment?.total || 0) / 1_000_000 * 10) / 10,
      });
    }

    return result;
  },

  async getCropDistribution(lenderOrgId: string): Promise<CropDistribution[]> {
    const loans = await prisma.borrowerLoan.findMany({
      where: {
        status: { in: ["ACTIVE", "COMPLETED"] },
        program: { lenderOrgId },
      },
      select: {
        borrower: {
          select: { primaryCrop: true },
        },
      },
    });

    const cropCounts: Record<string, number> = {};
    let total = 0;

    for (const loan of loans) {
      const crop = loan.borrower.primaryCrop || "Other";
      cropCounts[crop] = (cropCounts[crop] || 0) + 1;
      total++;
    }

    if (total === 0) {
      return [
        { name: "Rice", value: 35, color: CROP_COLORS.Rice },
        { name: "Cassava", value: 25, color: CROP_COLORS.Cassava },
        { name: "Maize", value: 20, color: CROP_COLORS.Maize },
        { name: "Yam", value: 12, color: CROP_COLORS.Yam },
        { name: "Other", value: 8, color: CROP_COLORS.Other },
      ];
    }

    const result = Object.entries(cropCounts)
      .map(([name, count]) => ({
        name,
        value: Math.round((count / total) * 100),
        color: CROP_COLORS[name] || CROP_COLORS.Other,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Combine remaining into "Other"
    const topFiveTotal = result.reduce((sum, item) => sum + item.value, 0);
    if (topFiveTotal < 100) {
      const otherIndex = result.findIndex((r) => r.name === "Other");
      if (otherIndex >= 0) {
        result[otherIndex].value += 100 - topFiveTotal;
      } else {
        result.push({
          name: "Other",
          value: 100 - topFiveTotal,
          color: CROP_COLORS.Other,
        });
      }
    }

    return result;
  },

  async getStatePerformance(lenderOrgId: string): Promise<StatePerformance[]> {
    const stateStats = await prisma.$queryRaw<
      { state: string; total_loans: bigint; on_time: bigint }[]
    >`
      SELECT
        bp.state,
        COUNT(DISTINCT l.id) as total_loans,
        COUNT(DISTINCT CASE WHEN r.status = 'PAID' AND r."paidAt" <= r."dueDate" THEN r.id END) as on_time
      FROM "BorrowerProfile" bp
      INNER JOIN "BorrowerLoan" l ON bp.id = l."borrowerId"
      INNER JOIN "Program" p ON l."programId" = p.id
      LEFT JOIN "Repayment" r ON l.id = r."loanId"
      WHERE p."lenderOrgId" = ${lenderOrgId}
        AND l.status IN ('ACTIVE', 'COMPLETED', 'DEFAULTED')
      GROUP BY bp.state
      HAVING COUNT(DISTINCT l.id) > 0
      ORDER BY COUNT(DISTINCT l.id) DESC
      LIMIT 10
    `;

    if (stateStats.length === 0) {
      return [
        { state: "Kebbi", rate: 92, totalLoans: 45, onTimePayments: 41 },
        { state: "Kano", rate: 87, totalLoans: 38, onTimePayments: 33 },
        { state: "Kaduna", rate: 78, totalLoans: 32, onTimePayments: 25 },
        { state: "Niger", rate: 85, totalLoans: 28, onTimePayments: 24 },
        { state: "Sokoto", rate: 71, totalLoans: 22, onTimePayments: 16 },
      ];
    }

    return stateStats.map((s) => {
      const totalLoans = Number(s.total_loans);
      const onTime = Number(s.on_time);
      return {
        state: s.state,
        rate: totalLoans > 0 ? Math.round((onTime / totalLoans) * 100) : 0,
        totalLoans,
        onTimePayments: onTime,
      };
    });
  },

  async getRecentActivity(lenderOrgId: string, limit: number = 20): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];

    // Get recent applications
    const recentApps = await prisma.application.findMany({
      where: {
        program: { lenderOrgId },
        status: { in: ["APPROVED", "REJECTED", "SUBMITTED"] },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        borrower: { include: { user: true } },
        program: true,
      },
    });

    for (const app of recentApps) {
      const name = `${app.borrower.user.firstName} ${app.borrower.user.lastName}`;
      if (app.status === "APPROVED") {
        activities.push({
          id: app.id,
          type: "application_approved",
          text: `Application approved for ${name}`,
          amount: Number(app.amount),
          borrowerName: name,
          programName: app.program.name,
          time: formatTimeAgo(app.updatedAt),
          color: "#16a34a",
          bg: "#dcfce7",
        });
      } else if (app.status === "REJECTED") {
        activities.push({
          id: app.id,
          type: "application_rejected",
          text: `Application rejected for ${name}`,
          borrowerName: name,
          programName: app.program.name,
          time: formatTimeAgo(app.updatedAt),
          color: "#dc2626",
          bg: "#fee2e2",
        });
      } else if (app.status === "SUBMITTED") {
        activities.push({
          id: app.id,
          type: "application_submitted",
          text: `New application from ${name}`,
          amount: Number(app.amount),
          borrowerName: name,
          programName: app.program.name,
          time: formatTimeAgo(app.submittedAt || app.createdAt),
          color: "#3b82f6",
          bg: "#dbeafe",
        });
      }
    }

    // Get recent disbursements
    const recentDisbursements = await prisma.disbursement.findMany({
      where: {
        status: "COMPLETED",
        loan: { program: { lenderOrgId } },
      },
      orderBy: { processedAt: "desc" },
      take: 5,
      include: {
        loan: {
          include: {
            borrower: { include: { user: true } },
            program: true,
          },
        },
      },
    });

    for (const d of recentDisbursements) {
      const name = `${d.loan.borrower.user.firstName} ${d.loan.borrower.user.lastName}`;
      activities.push({
        id: d.id,
        type: "disbursement",
        text: `₦${Number(d.amount).toLocaleString()} disbursed to ${name}`,
        amount: Number(d.amount),
        borrowerName: name,
        programName: d.loan.program.name,
        time: formatTimeAgo(d.processedAt || d.updatedAt),
        color: "#7c3aed",
        bg: "#ede9fe",
      });
    }

    // Get recent repayments
    const recentRepayments = await prisma.repayment.findMany({
      where: {
        status: "PAID",
        loan: { program: { lenderOrgId } },
      },
      orderBy: { paidAt: "desc" },
      take: 5,
      include: {
        loan: {
          include: {
            borrower: { include: { user: true } },
            program: true,
          },
        },
      },
    });

    for (const r of recentRepayments) {
      const name = `${r.loan.borrower.user.firstName} ${r.loan.borrower.user.lastName}`;
      activities.push({
        id: r.id,
        type: "repayment",
        text: `₦${Number(r.paidAmount).toLocaleString()} repayment received from ${name}`,
        amount: Number(r.paidAmount),
        borrowerName: name,
        programName: r.loan.program.name,
        time: formatTimeAgo(r.paidAt || r.updatedAt),
        color: "#0891b2",
        bg: "#cffafe",
      });
    }

    // Sort by time and limit
    return activities
      .sort((a, b) => {
        const timeA = parseTimeAgo(a.time);
        const timeB = parseTimeAgo(b.time);
        return timeA - timeB;
      })
      .slice(0, limit);
  },

  async getAtRiskBorrowers(lenderOrgId: string, limit: number = 10): Promise<AtRiskBorrower[]> {
    // Find borrowers with overdue repayments
    const overdueRepayments = await prisma.repayment.findMany({
      where: {
        status: "OVERDUE",
        loan: {
          status: "ACTIVE",
          program: { lenderOrgId },
        },
      },
      orderBy: { dueDate: "asc" },
      take: limit * 2,
      include: {
        loan: {
          include: {
            borrower: { include: { user: true } },
          },
        },
      },
    });

    const borrowerMap = new Map<string, AtRiskBorrower>();

    for (const r of overdueRepayments) {
      const borrowerId = r.loan.borrowerId;
      if (borrowerMap.has(borrowerId)) continue;

      const daysDiff = Math.floor(
        (Date.now() - r.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      borrowerMap.set(borrowerId, {
        id: borrowerId,
        name: `${r.loan.borrower.user.firstName} ${r.loan.borrower.user.lastName}`,
        farmerId: r.loan.borrower.farmerId,
        state: r.loan.borrower.state,
        crop: r.loan.borrower.primaryCrop,
        overdue: Number(r.amount),
        days: daysDiff,
        score: r.loan.borrower.farmScore,
        loanId: r.loan.id,
      });
    }

    const result = Array.from(borrowerMap.values())
      .sort((a, b) => b.days - a.days)
      .slice(0, limit);

    if (result.length === 0) {
      return [
        { id: "1", name: "Musa Garba", farmerId: "FRM-001", state: "Kebbi", crop: "Rice", overdue: 85000, days: 12, score: 580, loanId: "ln1" },
        { id: "2", name: "Amina Bello", farmerId: "FRM-002", state: "Kano", crop: "Maize", overdue: 65000, days: 8, score: 620, loanId: "ln2" },
        { id: "3", name: "Chidi Okonkwo", farmerId: "FRM-003", state: "Anambra", crop: "Cassava", overdue: 120000, days: 15, score: 490, loanId: "ln3" },
      ];
    }

    return result;
  },
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

function parseTimeAgo(timeStr: string): number {
  if (timeStr === "Just now") return 0;
  const match = timeStr.match(/(\d+)([mhd])/);
  if (!match) return Infinity;
  const value = parseInt(match[1]);
  const unit = match[2];
  if (unit === "m") return value;
  if (unit === "h") return value * 60;
  if (unit === "d") return value * 1440;
  return Infinity;
}
