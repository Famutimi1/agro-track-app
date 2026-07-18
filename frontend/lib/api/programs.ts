import { api, ApiResponse, PaginatedResponse } from "./client";

export interface Program {
  id: string;
  name: string;
  description: string;
  type: "INPUT_CREDIT" | "CASH_LOAN" | "EQUIPMENT_LEASE" | "INSURANCE";
  interestRate: number;
  maxAmount: number;
  minAmount: number;
  durationMonths: number;
  requiredScore: number;
  targetCrops: string[];
  targetStates: string[];
  maxBorrowers?: number;
  gracePeriodDays: number;
  disbursementType: string;
  trancheCount: number;
  collateralRequired: boolean;
  insuranceRequired: boolean;
  requiredDocuments: string[];
  totalFund?: number;
  minAge?: number;
  maxAge?: number;
  gender: string;
  cooperative: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED";
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  lenderOrg?: { id: string; name: string };
  _count?: { loans: number; applications: number };
}

export interface CreateProgramRequest {
  name: string;
  description: string;
  type?: "INPUT_CREDIT" | "CASH_LOAN" | "EQUIPMENT_LEASE" | "INSURANCE";
  interestRate: number;
  maxAmount: number;
  minAmount: number;
  durationMonths: number;
  requiredScore?: number;
  targetCrops?: string[];
  targetStates?: string[];
  maxBorrowers?: number;
  gracePeriodDays?: number;
  disbursementType?: "FULL" | "TRANCHE";
  trancheCount?: number;
  collateralRequired?: boolean;
  insuranceRequired?: boolean;
  requiredDocuments?: string[];
  totalFund?: number;
  minAge?: number;
  maxAge?: number;
  gender?: "ALL" | "FEMALE" | "MALE" | "YOUTH";
  cooperative?: "OPTIONAL" | "REQUIRED" | "NOT_REQUIRED";
  status?: "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED";
  startDate?: string;
  endDate?: string;
}

export interface ProgramsQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const programsApi = {
  list: async (query: ProgramsQuery = {}) => {
    const res = await api.get<PaginatedResponse<Program>>("/programs", { params: query });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Program>>(`/programs/${id}`);
    return res.data.data;
  },

  create: async (data: CreateProgramRequest) => {
    const res = await api.post<ApiResponse<Program>>("/programs", data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<CreateProgramRequest>) => {
    const res = await api.patch<ApiResponse<Program>>(`/programs/${id}`, data);
    return res.data.data;
  },

  updateStatus: async (id: string, status: Program["status"]) => {
    const res = await api.patch<ApiResponse<Program>>(`/programs/${id}/status`, { status });
    return res.data.data;
  },

  toggleStatus: async (id: string, active: boolean) => {
    const status = active ? "ACTIVE" : "PAUSED";
    const res = await api.patch<ApiResponse<Program>>(`/programs/${id}/status`, { status });
    return res.data.data;
  },

  // Public discovery endpoint
  discover: async (query: { state?: string; crop?: string; minScore?: number } = {}) => {
    const res = await api.get<PaginatedResponse<Program>>("/programs/discover", { params: query });
    return res.data;
  },

  getStats: async (id: string) => {
    const res = await api.get<ApiResponse<ProgramStats>>(`/programs/${id}/stats`);
    return res.data.data;
  },

  close: async (id: string, forceClose = false) => {
    const res = await api.post<ApiResponse<Program>>(`/programs/${id}/close`, { forceClose });
    return res.data.data;
  },

  duplicate: async (id: string) => {
    const res = await api.post<ApiResponse<Program>>(`/programs/${id}/duplicate`);
    return res.data.data;
  },
};

export interface ProgramStats {
  totalFund: number;
  totalDisbursed: number;
  totalRepaid: number;
  remainingFund: number | null;
  applicationsByStatus: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  loansByStatus: {
    total: number;
    active: number;
    completed: number;
    defaulted: number;
  };
  avgLoanAmount: number;
  repaymentRate: number;
}

export type LoanProgram = Program;
