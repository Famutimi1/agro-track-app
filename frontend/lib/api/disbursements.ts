import { api, ApiResponse, PaginatedResponse } from "./client";

export interface Disbursement {
  id: string;
  loanId: string;
  trancheNumber: number;
  amount: number;
  status: "PENDING" | "APPROVED" | "PROCESSING" | "COMPLETED" | "FAILED";
  approvedBy?: string;
  approvedAt?: string;
  failureReason?: string;
  paymentRef?: string;
  processedAt?: string;
  proofDocumentId?: string;
  createdAt: string;
  updatedAt: string;
  daysWaiting?: number;
  loan: {
    id: string;
    borrower: {
      id: string;
      farmerId: string;
      farmScore: number;
      farmScoreTier: string;
      state: string;
      user: {
        firstName: string;
        lastName: string;
      };
    };
    program: {
      id: string;
      name: string;
    };
  };
}

export interface DisbursementStats {
  pendingApproval: { count: number; amount: number };
  approvedToday: { count: number; amount: number };
  releasedThisMonth: { count: number; amount: number };
  avgProcessingDays: number;
  layerBreakdown: Array<{ layer: number; count: number; amount: number }>;
  monthlyTrend: Array<{ month: string; amount: number; count: number }>;
}

export interface DisbursementsQuery {
  page?: number;
  limit?: number;
  status?: string;
  programId?: string;
  state?: string;
  trancheNumber?: number;
  dateFrom?: string;
  dateTo?: string;
}

export const disbursementsApi = {
  list: async (query: DisbursementsQuery = {}) => {
    const res = await api.get<PaginatedResponse<Disbursement>>("/disbursements", { params: query });
    return res.data;
  },

  getPending: async (query: { page?: number; limit?: number } = {}) => {
    const res = await api.get<PaginatedResponse<Disbursement>>("/disbursements/pending", { params: query });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Disbursement>>(`/disbursements/${id}`);
    return res.data.data;
  },

  getStats: async () => {
    const res = await api.get<ApiResponse<DisbursementStats>>("/disbursements/stats");
    return res.data.data;
  },

  approve: async (id: string) => {
    const res = await api.post<ApiResponse<Disbursement>>(`/disbursements/${id}/approve`);
    return res.data.data;
  },

  reject: async (id: string, reason: string) => {
    const res = await api.post<ApiResponse<Disbursement>>(`/disbursements/${id}/reject`, { reason });
    return res.data.data;
  },

  retry: async (id: string) => {
    const res = await api.post<ApiResponse<Disbursement>>(`/disbursements/${id}/retry`);
    return res.data.data;
  },

  manualRelease: async (id: string, paymentRef: string, notes?: string) => {
    const res = await api.post<ApiResponse<Disbursement>>(`/disbursements/${id}/manual-release`, {
      paymentRef,
      notes,
    });
    return res.data.data;
  },

  bulkApprove: async (ids: string[]) => {
    const res = await api.post<ApiResponse<{ succeeded: number; failed: number; total: number }>>(
      "/disbursements/bulk/approve",
      { ids }
    );
    return res.data.data;
  },

  bulkReject: async (ids: string[], reason: string) => {
    const res = await api.post<ApiResponse<{ succeeded: number; failed: number; total: number }>>(
      "/disbursements/bulk/reject",
      { ids, reason }
    );
    return res.data.data;
  },
};

export const DISBURSEMENT_STATUSES = [
  { value: "PENDING", label: "Pending", color: "text-yellow-600", bg: "bg-yellow-100" },
  { value: "APPROVED", label: "Approved", color: "text-blue-600", bg: "bg-blue-100" },
  { value: "PROCESSING", label: "Processing", color: "text-purple-600", bg: "bg-purple-100" },
  { value: "COMPLETED", label: "Released", color: "text-green-600", bg: "bg-green-100" },
  { value: "FAILED", label: "Failed", color: "text-red-600", bg: "bg-red-100" },
];

export const REJECTION_REASONS = [
  { value: "PHOTOS_NOT_GEOTAGGED", label: "Photos not geotagged" },
  { value: "GPS_MISMATCH", label: "GPS mismatch (different location)" },
  { value: "PHOTOS_TOO_BLURRY", label: "Photos too blurry" },
  { value: "RECEIPTS_ALTERED", label: "Receipts appear altered" },
  { value: "CROP_STAGE_INCONSISTENT", label: "Crop stage inconsistent with timeline" },
  { value: "INSUFFICIENT_PROOF", label: "Insufficient proof documents" },
  { value: "OTHER", label: "Other" },
];
