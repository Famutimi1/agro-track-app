import { api, ApiResponse, PaginatedResponse } from "./client";

export interface Cooperative {
  id: string;
  name: string;
  registrationNumber?: string;
  state: string;
  lga: string;
  address?: string;
  chairPersonId?: string;
  phone?: string;
  email?: string;
  memberCount: number;
  totalDisbursed: number;
  repaymentRate: number;
  defaultRate: number;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  verifiedAt?: string;
  createdAt: string;
  chairPerson?: {
    id: string;
    user: { firstName: string; lastName: string; phone: string };
  };
}

export interface CooperativeMember {
  id: string;
  borrowerId: string;
  cooperativeId: string;
  role: "MEMBER" | "SECRETARY" | "TREASURER" | "CHAIR";
  joinedAt: string;
  borrower: {
    farmerId: string;
    farmScore: number;
    user: { firstName: string; lastName: string; phone: string };
  };
}

export interface CooperativesQuery {
  page?: number;
  limit?: number;
  state?: string;
  status?: string;
  search?: string;
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

  create: async (data: {
    name: string;
    registrationNumber?: string;
    state: string;
    lga: string;
    address?: string;
    phone?: string;
    email?: string;
  }) => {
    const res = await api.post<ApiResponse<Cooperative>>("/cooperatives", data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<{
    name: string;
    address: string;
    phone: string;
    email: string;
    status: string;
  }>) => {
    const res = await api.patch<ApiResponse<Cooperative>>(`/cooperatives/${id}`, data);
    return res.data.data;
  },

  getMembers: async (id: string) => {
    const res = await api.get<ApiResponse<CooperativeMember[]>>(`/cooperatives/${id}/members`);
    return res.data.data;
  },

  addMember: async (cooperativeId: string, borrowerId: string, role?: string) => {
    const res = await api.post<ApiResponse<CooperativeMember>>(`/cooperatives/${cooperativeId}/members`, {
      borrowerId,
      role: role || "MEMBER",
    });
    return res.data.data;
  },

  removeMember: async (cooperativeId: string, memberId: string) => {
    await api.delete(`/cooperatives/${cooperativeId}/members/${memberId}`);
  },

  updateMemberRole: async (cooperativeId: string, memberId: string, role: string) => {
    const res = await api.patch<ApiResponse<CooperativeMember>>(
      `/cooperatives/${cooperativeId}/members/${memberId}`,
      { role }
    );
    return res.data.data;
  },

  getStats: async (id: string) => {
    const res = await api.get<ApiResponse<{
      memberCount: number;
      totalLoans: number;
      activeLoans: number;
      totalDisbursed: number;
      totalRepaid: number;
      avgFarmScore: number;
      repaymentRate: number;
    }>>(`/cooperatives/${id}/stats`);
    return res.data.data;
  },

  verify: async (id: string) => {
    const res = await api.patch<ApiResponse<Cooperative>>(`/cooperatives/${id}/verify`);
    return res.data.data;
  },
};
