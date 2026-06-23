import { api, ApiResponse } from "./client";

export interface FarmScoreComponents {
  repaymentHistory: { score: number; onTimePayments: number; totalPayments: number };
  farmProductivity: { score: number; avgHealthRating: number; reportCount: number };
  creditUtilization: { score: number; totalBorrowed: number; totalRepaid: number };
  farmReportConsistency: { score: number; reportsLast6Months: number };
  cooperativeMembership: { score: number; isMember: boolean; coopRepaymentRate?: number };
  yearsOfExperience: { score: number; years: number };
}

export interface FarmScoreResult {
  score: number;
  tier: string;
  components: FarmScoreComponents;
  previousScore: number;
  change: number;
}

export interface FarmScoreHistory {
  id: string;
  borrowerId: string;
  score: number;
  previousScore?: number;
  tier: string;
  components: FarmScoreComponents;
  changeReason?: string;
  calculatedAt: string;
}

export interface ScoreBreakdown {
  score: number;
  tier: string;
  maxScore: number;
  percentile: number;
  nextTierThreshold: number | null;
  pointsToNextTier: number;
  tierBenefits: string[];
}

export const farmScoreApi = {
  getCurrent: async () => {
    const res = await api.get<ApiResponse<{
      score: number;
      tier: string;
      maxScore: number;
      weights: Record<string, number>;
    }>>("/farm-score/me");
    return res.data.data;
  },

  getHistory: async (limit = 12) => {
    const res = await api.get<ApiResponse<FarmScoreHistory[]>>("/farm-score/me/history", {
      params: { limit },
    });
    return res.data.data;
  },

  recalculate: async (borrowerId: string) => {
    const res = await api.post<ApiResponse<FarmScoreResult>>(`/farm-score/${borrowerId}/recalculate`);
    return res.data.data;
  },

  getBreakdown: async (score: number) => {
    const res = await api.get<ApiResponse<ScoreBreakdown>>(`/farm-score/breakdown/${score}`);
    return res.data.data;
  },
};
