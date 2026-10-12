import { api, ApiResponse, PaginatedResponse } from "./client";

export interface Application {
  id: string;
  borrowerId: string;
  programId: string;
  amount: number;
  purpose?: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  farmScoreAtApply?: number;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  program?: { name: string; lenderOrg?: { name: string } };
  borrower?: {
    farmerId: string;
    user: { firstName: string; lastName: string; email: string };
  };
  documents?: any[];
  loans?: { id: string; status: string }[];
}

export interface CreateApplicationRequest {
  programId: string;
  amount: number;
  purpose?: string;
}

export interface ReviewApplicationRequest {
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
  notes?: string;
}

export interface ApplicationsQuery {
  page?: number;
  limit?: number;
  status?: string;
  programId?: string;
}

export const applicationsApi = {
  // Borrower endpoints
  create: async (data: CreateApplicationRequest) => {
    const res = await api.post<ApiResponse<Application>>("/applications", data);
    return res.data.data;
  },

  listMine: async (query: ApplicationsQuery = {}) => {
    const res = await api.get<PaginatedResponse<Application>>("/applications/my", { params: query });
    return res.data;
  },

  submit: async (id: string) => {
    const res = await api.patch<ApiResponse<Application>>(`/applications/${id}/submit`);
    return res.data.data;
  },

  withdraw: async (id: string) => {
    const res = await api.patch<ApiResponse<Application>>(`/applications/${id}/withdraw`);
    return res.data.data;
  },

  // Lender endpoints
  list: async (query: ApplicationsQuery = {}) => {
    const res = await api.get<PaginatedResponse<Application>>("/applications", { params: query });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Application>>(`/applications/${id}`);
    return res.data.data;
  },

  review: async (id: string, approved: boolean, notes?: string) => {
    const data: ReviewApplicationRequest = {
      status: approved ? "APPROVED" : "REJECTED",
      notes,
    };
    const res = await api.patch<ApiResponse<Application>>(`/applications/${id}/review`, data);
    return res.data.data;
  },

  approve: async (id: string, approvedAmount: number, notes?: string) => {
    const res = await api.patch<ApiResponse<Application>>(`/applications/${id}/review`, { status: "APPROVED", notes });
    return res.data.data;
  },

  reject: async (id: string, reason: string) => {
    const res = await api.patch<ApiResponse<Application>>(`/applications/${id}/review`, { status: "REJECTED", rejectionReason: reason });
    return res.data.data;
  },

  markUnderReview: async (id: string) => {
    const res = await api.patch<ApiResponse<Application>>(`/applications/${id}/under-review`);
    return res.data.data;
  },
};
