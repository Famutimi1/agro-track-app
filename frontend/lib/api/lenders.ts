import { api, ApiResponse } from "./client";

export interface LenderOrganization {
  id: string;
  name: string;
  type: string;
  cacNumber?: string;
  plan: "STARTER" | "GROWTH" | "ENTERPRISE";
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
  verified: boolean;
  email: string;
  phone?: string;
  address?: string;
  state?: string;
  website?: string;
  logoUrl?: string;
  totalDisbursed: number;
  totalRecovered: number;
  defaultRate: number;
  activeBorrowers: number;
  createdAt: string;
}

export interface DashboardStats {
  totalBorrowers: number;
  activeBorrowers: number;
  totalLoans: number;
  activeLoans: number;
  totalDisbursed: number;
  totalRepaid: number;
  overdueAmount: number;
  repaymentRate: number;
  programCount: number;
  applicationsPending: number;
}

export interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  lastLoginAt?: string;
  createdAt: string;
}

export const lendersApi = {
  getMyOrganization: async () => {
    const res = await api.get<ApiResponse<LenderOrganization>>("/lenders/organization");
    return res.data.data;
  },

  updateOrganization: async (data: Partial<{
    name: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    logoUrl: string;
  }>) => {
    const res = await api.patch<ApiResponse<LenderOrganization>>("/lenders/organization", data);
    return res.data.data;
  },

  getDashboard: async () => {
    const res = await api.get<ApiResponse<DashboardStats>>("/lenders/dashboard");
    return res.data.data;
  },

  getTeamMembers: async () => {
    const res = await api.get<ApiResponse<TeamMember[]>>("/lenders/team");
    return res.data.data;
  },

  inviteTeamMember: async (data: {
    email: string;
    firstName: string;
    lastName: string;
    role: "LENDER_MANAGER" | "LENDER_VIEWER" | "LENDER_ANALYST";
  }) => {
    const res = await api.post<ApiResponse<TeamMember>>("/lenders/team", data);
    return res.data.data;
  },

  removeTeamMember: async (userId: string) => {
    await api.delete(`/lenders/me/team/${userId}`);
  },
};
