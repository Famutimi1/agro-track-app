import { api, ApiResponse, PaginatedResponse } from "./client";
import { Loan } from "./loans";

export interface Cooperative {
  id: string;
  name: string;
  regNumber?: string;
  state: string;
  lga?: string;
  address?: string;
  chairPersonId?: string;
  memberCount: number;
  maxMembers: number;
  status: "ACTIVE" | "SUSPENDED" | "DISSOLVED" | "WATCH";
  totalLoans: number;
  repaymentRate: number;
  groupFarmScore: number;
  groupTier: "GOLD" | "SILVER" | "BRONZE";
  lenderOrgId?: string;
  createdAt: string;
  updatedAt: string;
  lenderOrg?: { name: string };
  _count?: { members: number };
  members?: CooperativeMember[];
}

export interface CooperativeMember {
  id: string;
  farmerId: string;
  farmScore: number;
  farmScoreTier: string;
  cooperativeId: string;
  role: string;
  loanStatus: string;
  totalLoans: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  loans: Array<{
    id: string;
    amount: number;
    status: string;
    amountPaid: number;
    totalRepayable: number;
  }>;
}

export interface CooperativeStats {
  memberCount: number;
  maxMembers: number;
  groupFarmScore: number;
  groupTier: string;
  scoreDistribution: {
    EXCELLENT: number;
    GOOD: number;
    FAIR: number;
    POOR: number;
  };
  totalDisbursed: number;
  totalRepaid: number;
  repaymentRate: number;
  activeLoans: number;
  completedLoans: number;
  defaultedLoans: number;
}

export interface GroupScore {
  groupScore: number;
  tier: string;
  formula: {
    avgMemberScore: number;
    memberScoreWeight: number;
    repaymentRate: number;
    repaymentWeight: number;
    reportingConsistency: number;
    reportingWeight: number;
  };
  memberScores: Array<{
    borrowerId: string;
    name: string;
    score: number;
    tier: string;
  }>;
}

export interface CooperativesQuery {
  page?: number;
  limit?: number;
  state?: string;
  status?: string;
  search?: string;
  cropFocus?: string;
}

export interface CreateCooperativeRequest {
  name: string;
  state: string;
  lga?: string;
  address?: string;
  regNumber?: string;
  chairPersonId?: string;
  maxMembers?: number;
}

export const cooperativesApi = {
  list: async (query: CooperativesQuery = {}) => {
    const res = await api.get<PaginatedResponse<Cooperative>>("/cooperatives", { params: query });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Cooperative>>(`/cooperatives/${id}`);
    return res.data.data;
  },

  create: async (data: CreateCooperativeRequest) => {
    const res = await api.post<ApiResponse<Cooperative>>("/cooperatives", data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<{
    name: string;
    state: string;
    lga: string;
    address: string;
    chairPersonId: string;
    maxMembers: number;
  }>) => {
    const res = await api.patch<ApiResponse<Cooperative>>(`/cooperatives/${id}`, data);
    return res.data.data;
  },

  getMembers: async (id: string, query: { page?: number; limit?: number } = {}) => {
    const res = await api.get<PaginatedResponse<CooperativeMember>>(`/cooperatives/${id}/members`, { params: query });
    return res.data;
  },

  addMember: async (cooperativeId: string, borrowerId: string) => {
    const res = await api.post<ApiResponse<Cooperative>>(`/cooperatives/${cooperativeId}/members`, { borrowerId });
    return res.data.data;
  },

  removeMember: async (cooperativeId: string, borrowerId: string, reason?: string) => {
    const res = await api.delete<ApiResponse<Cooperative>>(`/cooperatives/${cooperativeId}/members/${borrowerId}`, {
      data: { reason },
    });
    return res.data.data;
  },

  getLoans: async (id: string, query: { page?: number; limit?: number } = {}) => {
    const res = await api.get<PaginatedResponse<Loan>>(`/cooperatives/${id}/loans`, { params: query });
    return res.data;
  },

  getStats: async (id: string) => {
    const res = await api.get<ApiResponse<CooperativeStats>>(`/cooperatives/${id}/stats`);
    return res.data.data;
  },

  getGroupScore: async (id: string) => {
    const res = await api.get<ApiResponse<GroupScore>>(`/cooperatives/${id}/score`);
    return res.data.data;
  },

  suspend: async (id: string, reason: string) => {
    const res = await api.post<ApiResponse<Cooperative>>(`/cooperatives/${id}/suspend`, { reason });
    return res.data.data;
  },

  reactivate: async (id: string) => {
    const res = await api.post<ApiResponse<Cooperative>>(`/cooperatives/${id}/reactivate`);
    return res.data.data;
  },

  dissolve: async (id: string, reason: string) => {
    const res = await api.post<ApiResponse<{ success: boolean; message: string }>>(`/cooperatives/${id}/dissolve`, { reason });
    return res.data.data;
  },
};

export const COOP_STATUSES = [
  { value: "ACTIVE", label: "Active", color: "text-green-600", bg: "bg-green-100" },
  { value: "SUSPENDED", label: "Suspended", color: "text-yellow-600", bg: "bg-yellow-100" },
  { value: "WATCH", label: "Under Watch", color: "text-orange-600", bg: "bg-orange-100" },
  { value: "DISSOLVED", label: "Dissolved", color: "text-red-600", bg: "bg-red-100" },
];

export const GROUP_TIERS = [
  { value: "GOLD", label: "Gold", color: "text-yellow-600", bg: "bg-yellow-100", min: 700 },
  { value: "SILVER", label: "Silver", color: "text-gray-500", bg: "bg-gray-200", min: 500 },
  { value: "BRONZE", label: "Bronze", color: "text-orange-600", bg: "bg-orange-100", min: 0 },
];
