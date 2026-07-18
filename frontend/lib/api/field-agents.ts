import { api, ApiResponse, PaginatedResponse } from "./client";

export interface FieldAgent {
  id: string;
  userId: string;
  agentCode: string;
  state: string;
  lga?: string;
  coverageArea: string[];
  registrations: number;
  verifications: number;
  inspections: number;
  rating: number;
  totalRatings: number;
  commissionRate: number;
  totalEarnings: number;
  supervisorId?: string;
  active: boolean;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    createdAt?: string;
  };
  _count?: {
    visits: number;
  };
  visits?: FieldVisit[];
}

export interface FieldVisit {
  id: string;
  agentId: string;
  borrowerId?: string;
  purpose: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  status: string;
  scheduledAt?: string;
  completedAt?: string;
  rating?: number;
  createdAt: string;
}

export interface AgentStats {
  totalAgents: number;
  activeAgents: number;
  farmersRegisteredThisMonth: number;
  farmsVerifiedThisMonth: number;
  visitsThisMonth: number;
}

export interface AgentEarnings {
  rates: {
    registration: number;
    verification: number;
    monitoring: number;
  };
  lifetime: {
    registrations: { count: number; amount: number };
    verifications: { count: number; amount: number };
    inspections: { count: number; amount: number };
    total: number;
  };
  thisMonth: {
    visits: number;
    estimated: number;
  };
  pendingPayout: number;
}

export interface FieldAgentsQuery {
  page?: number;
  limit?: number;
  state?: string;
  active?: boolean;
  search?: string;
}

export interface CreateAgentRequest {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  state: string;
  lga?: string;
  coverageArea?: string[];
}

export interface AssignTaskRequest {
  taskType: "REGISTRATION" | "VERIFICATION" | "MONITORING";
  borrowerId: string;
  dueDate: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  notes?: string;
}

export const fieldAgentsApi = {
  list: async (query: FieldAgentsQuery = {}) => {
    const res = await api.get<PaginatedResponse<FieldAgent>>("/field-agents", { params: query });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<FieldAgent>>(`/field-agents/${id}`);
    return res.data.data;
  },

  getStats: async () => {
    const res = await api.get<ApiResponse<AgentStats>>("/field-agents/stats");
    return res.data.data;
  },

  create: async (data: CreateAgentRequest) => {
    const res = await api.post<ApiResponse<FieldAgent>>("/field-agents", data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<{
    state: string;
    lga: string;
    coverageArea: string[];
    commissionRate: number;
  }>) => {
    const res = await api.patch<ApiResponse<FieldAgent>>(`/field-agents/${id}`, data);
    return res.data.data;
  },

  activate: async (id: string) => {
    const res = await api.post<ApiResponse<FieldAgent>>(`/field-agents/${id}/activate`);
    return res.data.data;
  },

  deactivate: async (id: string, reason: string) => {
    const res = await api.post<ApiResponse<FieldAgent>>(`/field-agents/${id}/deactivate`, { reason });
    return res.data.data;
  },

  getTasks: async (id: string, query: { page?: number; limit?: number; status?: string } = {}) => {
    const res = await api.get<PaginatedResponse<FieldVisit>>(`/field-agents/${id}/tasks`, { params: query });
    return res.data;
  },

  assignTask: async (id: string, data: AssignTaskRequest) => {
    const res = await api.post<ApiResponse<FieldVisit>>(`/field-agents/${id}/tasks`, data);
    return res.data.data;
  },

  getEarnings: async (id: string) => {
    const res = await api.get<ApiResponse<AgentEarnings>>(`/field-agents/${id}/earnings`);
    return res.data.data;
  },

  approvePayout: async (id: string, amount: number) => {
    const res = await api.post<ApiResponse<{ success: boolean; amount: number }>>(`/field-agents/${id}/payout`, { amount });
    return res.data.data;
  },

  getVerifications: async (id: string, query: { page?: number; limit?: number } = {}) => {
    const res = await api.get<PaginatedResponse<FieldVisit>>(`/field-agents/${id}/verifications`, { params: query });
    return res.data;
  },

  getQualitySamples: async (id: string, count: number = 5) => {
    const res = await api.get<ApiResponse<FieldVisit[]>>(`/field-agents/${id}/quality-samples`, { params: { count } });
    return res.data.data;
  },

  rateVerification: async (visitId: string, rating: number, notes?: string) => {
    const res = await api.post<ApiResponse<{ success: boolean }>>(`/field-agents/verifications/${visitId}/rate`, {
      rating,
      notes,
    });
    return res.data.data;
  },

  rateAgent: async (id: string, rating: number) => {
    const res = await api.post<ApiResponse<FieldAgent>>(`/field-agents/${id}/rate`, { rating });
    return res.data.data;
  },
};

export const TASK_TYPES = [
  { value: "REGISTRATION", label: "Farmer Registration", earning: 1500 },
  { value: "VERIFICATION", label: "Farm Verification", earning: 1000 },
  { value: "MONITORING", label: "Monitoring Visit", earning: 500 },
];

export const TASK_PRIORITIES = [
  { value: "LOW", label: "Low", color: "text-blue-600", bg: "bg-blue-100" },
  { value: "MEDIUM", label: "Medium", color: "text-yellow-600", bg: "bg-yellow-100" },
  { value: "HIGH", label: "High", color: "text-red-600", bg: "bg-red-100" },
];

export const VISIT_STATUSES = [
  { value: "SCHEDULED", label: "Scheduled", color: "text-blue-600", bg: "bg-blue-100" },
  { value: "IN_PROGRESS", label: "In Progress", color: "text-yellow-600", bg: "bg-yellow-100" },
  { value: "COMPLETED", label: "Completed", color: "text-green-600", bg: "bg-green-100" },
  { value: "OVERDUE", label: "Overdue", color: "text-red-600", bg: "bg-red-100" },
];
