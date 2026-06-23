import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { logger } from "../config/logger";

interface ScoreComponents {
  repaymentHistory: number;
  farmProductivity: number;
  creditUtilization: number;
  farmReportConsistency: number;
  cooperativeMembership: number;
  yearsOfExperience: number;
}

interface DetailedComponents {
  repaymentHistory: { score: number; onTimePayments: number; totalPayments: number };
  farmProductivity: { score: number; avgHealthRating: number; reportCount: number };
  creditUtilization: { score: number; totalBorrowed: number; totalRepaid: number };
  farmReportConsistency: { score: number; reportsLast6Months: number };
  cooperativeMembership: { score: number; isMember: boolean; coopRepaymentRate?: number };
  yearsOfExperience: { score: number; years: number };
}

const WEIGHTS = {
  repaymentHistory: 0.30,
  farmProductivity: 0.25,
  creditUtilization: 0.20,
  farmReportConsistency: 0.10,
  cooperativeMembership: 0.08,
  yearsOfExperience: 0.07,
};

const MAX_SCORE = 850;

export class FarmScoreService {
  static calculateScore(components: ScoreComponents): number {
    const raw =
      components.repaymentHistory * WEIGHTS.repaymentHistory +
      components.farmProductivity * WEIGHTS.farmProductivity +
      components.creditUtilization * WEIGHTS.creditUtilization +
      components.farmReportConsistency * WEIGHTS.farmReportConsistency +
      components.cooperativeMembership * WEIGHTS.cooperativeMembership +
      components.yearsOfExperience * WEIGHTS.yearsOfExperience;

    return Math.round(Math.min(MAX_SCORE, Math.max(0, raw)));
  }

  static getTier(score: number): string {
    if (score >= 750) return "EXCELLENT";
    if (score >= 650) return "GOOD";
    if (score >= 500) return "FAIR";
    if (score >= 350) return "POOR";
    return "VERY_POOR";
  }

  static async recalculate(borrowerId: string, reason?: string) {
    const profile = await prisma.borrowerProfile.findUnique({
      where: { id: borrowerId },
      include: {
        loans: { include: { repayments: true } },
        farmReports: true,
        cooperative: true,
      },
    });
    if (!profile) throw ApiError.notFound("Borrower not found");

    const previousScore = profile.farmScore;
    const detailed = this.computeDetailedComponents(profile);

    const components: ScoreComponents = {
      repaymentHistory: detailed.repaymentHistory.score,
      farmProductivity: detailed.farmProductivity.score,
      creditUtilization: detailed.creditUtilization.score,
      farmReportConsistency: detailed.farmReportConsistency.score,
      cooperativeMembership: detailed.cooperativeMembership.score,
      yearsOfExperience: detailed.yearsOfExperience.score,
    };

    const score = this.calculateScore(components);
    const tier = this.getTier(score);

    await prisma.borrowerProfile.update({
      where: { id: borrowerId },
      data: { farmScore: score, farmScoreTier: tier },
    });

    await prisma.farmScoreHistory.create({
      data: {
        borrowerId,
        score,
        previousScore,
        tier,
        components: detailed as any,
        changeReason: reason || "Scheduled recalculation",
      },
    });

    logger.info("FarmScore recalculated", {
      borrowerId,
      previousScore,
      newScore: score,
      change: score - previousScore,
    });

    return { score, tier, components: detailed, previousScore, change: score - previousScore };
  }

  private static computeDetailedComponents(profile: any): DetailedComponents {
    // 1. Repayment History (30%)
    const allRepayments = profile.loans.flatMap((l: any) => l.repayments);
    const paidRepayments = allRepayments.filter((r: any) => r.status === "PAID");
    const onTimePayments = paidRepayments.filter((r: any) =>
      r.paidAt && new Date(r.paidAt) <= new Date(r.dueDate)
    ).length;

    let repaymentScore = 425; // Base score for no history
    if (allRepayments.length > 0) {
      const onTimeRate = onTimePayments / allRepayments.length;
      const paidRate = paidRepayments.length / allRepayments.length;
      // Weighted: 70% on-time rate, 30% completion rate
      repaymentScore = (onTimeRate * 0.7 + paidRate * 0.3) * MAX_SCORE;
    }

    // 2. Farm Productivity (25%)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentReports = profile.farmReports.filter((r: any) =>
      new Date(r.createdAt) >= sixMonthsAgo
    );

    const verifiedReports = recentReports.filter((r: any) => r.status === "VERIFIED");
    const avgHealth = verifiedReports.length > 0
      ? verifiedReports.reduce((sum: number, r: any) => sum + (r.healthRating || 3), 0) / verifiedReports.length
      : recentReports.length > 0
      ? recentReports.reduce((sum: number, r: any) => sum + (r.healthRating || 3), 0) / recentReports.length
      : 3;

    const productivityScore = (avgHealth / 5) * MAX_SCORE;

    // 3. Credit Utilization (20%)
    const totalBorrowed = profile.loans.reduce((s: number, l: any) => s + Number(l.amount), 0);
    const totalRepaid = paidRepayments.reduce((s: number, r: any) => s + Number(r.paidAmount || 0), 0);

    let utilizationScore = 425;
    if (totalBorrowed > 0) {
      const utilizationRate = Math.min(1, totalRepaid / totalBorrowed);
      utilizationScore = utilizationRate * MAX_SCORE;
    }

    // 4. Farm Report Consistency (10%)
    // Expect at least 1 report per month = 6 in 6 months
    const consistencyScore = Math.min(MAX_SCORE, (recentReports.length / 6) * MAX_SCORE);

    // 5. Cooperative Membership (8%)
    let coopScore = 200; // Base for non-members
    let coopRepaymentRate: number | undefined;

    if (profile.cooperativeId && profile.cooperative) {
      coopScore = 600; // Base for members
      coopRepaymentRate = profile.cooperative.repaymentRate;
      // Bonus based on cooperative's overall repayment rate
      if (coopRepaymentRate && coopRepaymentRate > 80) {
        coopScore = Math.min(MAX_SCORE, coopScore + (coopRepaymentRate - 80) * 5);
      }
    }

    // 6. Years of Experience (7%)
    const years = profile.yearsExperience || 1;
    // Cap at 10 years for max score
    const experienceScore = Math.min(MAX_SCORE, (Math.min(years, 10) / 10) * MAX_SCORE);

    return {
      repaymentHistory: {
        score: Math.round(repaymentScore),
        onTimePayments,
        totalPayments: allRepayments.length,
      },
      farmProductivity: {
        score: Math.round(productivityScore),
        avgHealthRating: Math.round(avgHealth * 10) / 10,
        reportCount: verifiedReports.length,
      },
      creditUtilization: {
        score: Math.round(utilizationScore),
        totalBorrowed,
        totalRepaid,
      },
      farmReportConsistency: {
        score: Math.round(consistencyScore),
        reportsLast6Months: recentReports.length,
      },
      cooperativeMembership: {
        score: Math.round(coopScore),
        isMember: !!profile.cooperativeId,
        coopRepaymentRate,
      },
      yearsOfExperience: {
        score: Math.round(experienceScore),
        years,
      },
    };
  }

  static async getHistory(userId: string, limit = 12) {
    const profile = await prisma.borrowerProfile.findUnique({ where: { userId } });
    if (!profile) throw ApiError.notFound("Borrower profile not found");

    return prisma.farmScoreHistory.findMany({
      where: { borrowerId: profile.id },
      orderBy: { calculatedAt: "desc" },
      take: limit,
    });
  }

  static async getCurrentScore(userId: string) {
    const profile = await prisma.borrowerProfile.findUnique({
      where: { userId },
      select: { id: true, farmScore: true, farmScoreTier: true },
    });
    if (!profile) throw ApiError.notFound("Borrower profile not found");

    return {
      score: profile.farmScore,
      tier: profile.farmScoreTier,
      maxScore: MAX_SCORE,
      weights: WEIGHTS,
    };
  }

  static async recalculateAll() {
    const BATCH_SIZE = 50;
    let updated = 0;
    let offset = 0;
    let totalCount = 0;

    // Process in batches to avoid memory issues
    while (true) {
      const borrowers = await prisma.borrowerProfile.findMany({
        skip: offset,
        take: BATCH_SIZE,
        select: { id: true },
      });

      if (borrowers.length === 0) break;

      totalCount += borrowers.length;

      // Process batch concurrently with limited parallelism
      const results = await Promise.allSettled(
        borrowers.map((b) => this.recalculate(b.id, "Bulk recalculation"))
      );

      for (let i = 0; i < results.length; i++) {
        if (results[i].status === "fulfilled") {
          updated++;
        } else {
          const error = (results[i] as PromiseRejectedResult).reason;
          logger.error("Failed to recalculate score", {
            borrowerId: borrowers[i].id,
            error: error?.message || "Unknown error",
          });
        }
      }

      offset += BATCH_SIZE;

      // Small delay between batches to prevent overwhelming the database
      if (borrowers.length === BATCH_SIZE) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    logger.info("Bulk FarmScore recalculation complete", { total: totalCount, updated });
    return { total: totalCount, updated };
  }

  static getScoreBreakdown(score: number) {
    const tier = this.getTier(score);
    const nextTierThreshold = score >= 750 ? null : score >= 650 ? 750 : score >= 500 ? 650 : score >= 350 ? 500 : 350;
    const pointsToNextTier = nextTierThreshold ? nextTierThreshold - score : 0;

    return {
      score,
      tier,
      maxScore: MAX_SCORE,
      percentile: Math.round((score / MAX_SCORE) * 100),
      nextTierThreshold,
      pointsToNextTier,
      tierBenefits: this.getTierBenefits(tier),
    };
  }

  private static getTierBenefits(tier: string) {
    const benefits: Record<string, string[]> = {
      EXCELLENT: [
        "Lowest interest rates (up to 2% discount)",
        "Priority loan processing",
        "Access to all loan programs",
        "Higher loan limits",
        "Single-tranche disbursement option",
      ],
      GOOD: [
        "Competitive interest rates",
        "Standard loan processing",
        "Access to most loan programs",
        "Standard loan limits",
      ],
      FAIR: [
        "Standard interest rates",
        "Standard loan processing",
        "Limited program access",
        "Moderate loan limits",
      ],
      POOR: [
        "Higher interest rates",
        "Additional verification required",
        "Basic programs only",
        "Lower loan limits",
        "Mandatory cooperative membership",
      ],
      VERY_POOR: [
        "Limited loan access",
        "Mandatory training program",
        "Micro-loans only",
        "Requires guarantor or collateral",
      ],
    };
    return benefits[tier] || [];
  }
}
