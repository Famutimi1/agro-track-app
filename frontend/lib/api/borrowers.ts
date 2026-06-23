import { api, ApiResponse, PaginatedResponse } from "./client";

export interface BorrowerProfile {
  id: string;
  farmerId: string;
  bvn?: string;
  bvnVerified: boolean;
  nin?: string;
  ninVerified: boolean;
  dateOfBirth?: string;
  gender?: string;
  state: string;
  lga: string;
  address?: string;
  farmSizeHa: number;
  farmLatitude?: number;
  farmLongitude?: number;
  farmAddress?: string;
  primaryCrop: string;
  secondaryCrops: string[];
  farmScore: number;
  farmScoreTier: string;
  bankName?: string;
  bankAccount?: string;
  bankCode?: string;
  language: string;
  yearsExperience: number;
  irrigationType?: string;
  soilType?: string;
  cooperativeId?: string;
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorRelation?: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  cooperative?: { id: string; name: string };
}

export interface BorrowersQuery {
  page?: number;
  limit?: number;
  state?: string;
  search?: string;
  cooperativeId?: string;
}

export const borrowersApi = {
  list: async (query: BorrowersQuery = {}) => {
    const res = await api.get<PaginatedResponse<BorrowerProfile>>("/borrowers", { params: query });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<BorrowerProfile>>(`/borrowers/${id}`);
    return res.data.data;
  },

  getMyProfile: async () => {
    const res = await api.get<ApiResponse<BorrowerProfile>>("/borrowers/me");
    return res.data.data;
  },

  updateMyProfile: async (data: Partial<{
    phone: string;
    address: string;
    farmSizeHa: number;
    farmLatitude: number;
    farmLongitude: number;
    farmAddress: string;
    secondaryCrops: string[];
    bankName: string;
    bankAccount: string;
    bankCode: string;
    irrigationType: string;
    soilType: string;
    guarantorName: string;
    guarantorPhone: string;
    guarantorRelation: string;
  }>) => {
    const res = await api.patch<ApiResponse<BorrowerProfile>>("/borrowers/me", data);
    return res.data.data;
  },
};
