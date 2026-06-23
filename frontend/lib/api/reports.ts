import { api, ApiResponse, PaginatedResponse } from "./client";

export interface Report {
  id: string;
  type: "LOAN_PORTFOLIO" | "REPAYMENT_ANALYSIS" | "BORROWER_DEMOGRAPHICS" | "FIELD_ACTIVITY" | "DISBURSEMENT_SUMMARY" | "DEFAULT_ANALYSIS" | "FARM_SCORE_DISTRIBUTION" | "COOPERATIVE_PERFORMANCE";
  name: string;
  description?: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  parameters: Record<string, any>;
  fileUrl?: string;
  format: "PDF" | "CSV" | "XLSX";
  generatedBy: string;
  generatedAt?: string;
  expiresAt?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface ReportRequest {
  type: Report["type"];
  name: string;
  description?: string;
  format: "PDF" | "CSV" | "XLSX";
  parameters?: {
    startDate?: string;
    endDate?: string;
    programId?: string;
    state?: string;
    cooperativeId?: string;
    includeCharts?: boolean;
  };
}

export interface ReportsQuery {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
}

export const reportsApi = {
  list: async (query: ReportsQuery = {}) => {
    const res = await api.get<PaginatedResponse<Report>>("/reports", { params: query });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Report>>(`/reports/${id}`);
    return res.data.data;
  },

  generate: async (data: ReportRequest) => {
    const res = await api.post<ApiResponse<Report>>("/reports", data);
    return res.data.data;
  },

  download: async (id: string) => {
    const res = await api.get<Blob>(`/reports/${id}/download`, {
      responseType: "blob",
    });
    return res.data;
  },

  cancel: async (id: string) => {
    await api.patch(`/reports/${id}/cancel`);
  },

  delete: async (id: string) => {
    await api.delete(`/reports/${id}`);
  },

  getAvailableTypes: async () => {
    const res = await api.get<ApiResponse<{
      type: string;
      name: string;
      description: string;
      parameters: string[];
    }[]>>("/reports/types");
    return res.data.data;
  },
};
