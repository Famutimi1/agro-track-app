import { api, ApiResponse, PaginatedResponse } from "./client";

export interface FarmReport {
  id: string;
  borrowerId: string;
  submittedById?: string;
  type: string;
  title: string;
  description?: string;
  cropStage?: "PLANTING" | "GERMINATION" | "VEGETATIVE" | "FLOWERING" | "FRUITING" | "HARVEST" | "POST_HARVEST";
  healthRating?: number;
  images: string[];
  latitude?: number;
  longitude?: number;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionNote?: string;
  weatherData?: any;
  soilMoisture?: number;
  pestPresent: boolean;
  pestDetails?: string;
  createdAt: string;
  borrower?: {
    farmerId: string;
    user: { firstName: string; lastName: string };
  };
}

export interface CreateFarmReportRequest {
  type: string;
  title: string;
  description?: string;
  cropStage?: string;
  healthRating?: number;
  images?: string[];
  latitude?: number;
  longitude?: number;
  pestPresent?: boolean;
  pestDetails?: string;
}

export interface FarmReportsQuery {
  page?: number;
  limit?: number;
  status?: string;
  borrowerId?: string;
}

export const farmReportsApi = {
  // Borrower endpoints
  create: async (data: CreateFarmReportRequest) => {
    const res = await api.post<ApiResponse<FarmReport>>("/farm-reports", data);
    return res.data.data;
  },

  uploadPhotos: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("photos", file));
    const res = await api.post<ApiResponse<{ urls: string[] }>>("/farm-reports/upload-photos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  listMine: async (query: FarmReportsQuery = {}) => {
    const res = await api.get<PaginatedResponse<FarmReport>>("/farm-reports/me", { params: query });
    return res.data;
  },

  // Lender endpoints
  list: async (query: FarmReportsQuery = {}) => {
    const res = await api.get<PaginatedResponse<FarmReport>>("/farm-reports", { params: query });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<FarmReport>>(`/farm-reports/${id}`);
    return res.data.data;
  },

  verify: async (id: string) => {
    const res = await api.patch<ApiResponse<FarmReport>>(`/farm-reports/${id}/verify`);
    return res.data.data;
  },

  reject: async (id: string, rejectionNote: string) => {
    const res = await api.patch<ApiResponse<FarmReport>>(`/farm-reports/${id}/reject`, { rejectionNote });
    return res.data.data;
  },
};
