import { api } from "./client";

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

export interface DashboardData {
  stats: DashboardStats;
  trends: TrendData[];
  cropDistribution: CropDistribution[];
  statePerformance: StatePerformance[];
  recentActivity: RecentActivity[];
  atRiskBorrowers: AtRiskBorrower[];
}

export const dashboardApi = {
  async getAll(): Promise<DashboardData> {
    const response = await api.get<{ success: boolean; data: DashboardData }>("/dashboard");
    return response.data.data;
  },

  async getStats(): Promise<DashboardStats> {
    const response = await api.get<{ success: boolean; data: DashboardStats }>("/dashboard/stats");
    return response.data.data;
  },

  async getTrends(months: number = 12): Promise<TrendData[]> {
    const response = await api.get<{ success: boolean; data: TrendData[] }>(
      `/dashboard/trends?months=${months}`
    );
    return response.data.data;
  },

  async getCropDistribution(): Promise<CropDistribution[]> {
    const response = await api.get<{ success: boolean; data: CropDistribution[] }>(
      "/dashboard/crop-distribution"
    );
    return response.data.data;
  },

  async getStatePerformance(): Promise<StatePerformance[]> {
    const response = await api.get<{ success: boolean; data: StatePerformance[] }>(
      "/dashboard/state-performance"
    );
    return response.data.data;
  },

  async getRecentActivity(limit: number = 20): Promise<RecentActivity[]> {
    const response = await api.get<{ success: boolean; data: RecentActivity[] }>(
      `/dashboard/recent-activity?limit=${limit}`
    );
    return response.data.data;
  },

  async getAtRiskBorrowers(limit: number = 10): Promise<AtRiskBorrower[]> {
    const response = await api.get<{ success: boolean; data: AtRiskBorrower[] }>(
      `/dashboard/at-risk-borrowers?limit=${limit}`
    );
    return response.data.data;
  },
};
