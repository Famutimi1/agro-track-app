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
  type?: string;
  interestRate: number;
  maxAmount: number;
  minAmount: number;
  durationMonths: number;
  requiredScore?: number;
  targetCrops?: string[];
  targetStates?: string[];
  maxBorrowers?: number;
  gracePeriodDays?: number;
  disbursementType?: string;
  trancheCount?: number;
  collateralRequired?: boolean;
  insuranceRequired?: boolean;
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
};

export type LoanProgram = Program;
