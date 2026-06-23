import { api, ApiResponse, PaginatedResponse } from "./client";

export interface FieldAgent {
  id: string;
  userId: string;
  lenderId: string;
  supervisorId?: string;
  employeeId: string;
  assignedState: string;
  assignedLgas: string[];
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  currentLatitude?: number;
  currentLongitude?: number;
  lastLocationUpdate?: string;
  deviceId?: string;
  totalVisits: number;
  completedVisits: number;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  supervisor?: {
    user: { firstName: string; lastName: string };
  };
}

export interface FieldVisit {
  id: string;
  fieldAgentId: string;
  borrowerId: string;
  applicationId?: string;
  loanId?: string;
  purpose: string;
  scheduledDate: string;
  actualDate?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  latitude?: number;
  longitude?: number;
  arrivalTime?: string;
  departureTime?: string;
  findings?: string;
  recommendation?: "APPROVE" | "REJECT" | "NEEDS_REVIEW";
  photos: string[];
  signature?: string;
  borrowerPresent: boolean;
  farmVerified: boolean;
  notes?: string;
  createdAt: string;
  fieldAgent?: FieldAgent;
  borrower?: {
    farmerId: string;
    user: { firstName: string; lastName: string };
  };
}

export interface FieldAgentsQuery {
  page?: number;
  limit?: number;
  status?: string;
  state?: string;
}

export interface FieldVisitsQuery {
  page?: number;
  limit?: number;
  status?: string;
  agentId?: string;
  borrowerId?: string;
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

  create: async (data: {
    userId: string;
    employeeId: string;
    assignedState: string;
    assignedLgas: string[];
    supervisorId?: string;
  }) => {
    const res = await api.post<ApiResponse<FieldAgent>>("/field-agents", data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<{
    assignedState: string;
    assignedLgas: string[];
    supervisorId: string;
    status: string;
  }>) => {
    const res = await api.patch<ApiResponse<FieldAgent>>(`/field-agents/${id}`, data);
    return res.data.data;
  },

  updateLocation: async (latitude: number, longitude: number) => {
    const res = await api.post<ApiResponse<void>>("/field-agents/me/location", { latitude, longitude });
    return res.data.data;
  },

  getMyProfile: async () => {
    const res = await api.get<ApiResponse<FieldAgent>>("/field-agents/me");
    return res.data.data;
  },

  getMyVisits: async (query: { status?: string } = {}) => {
    const res = await api.get<ApiResponse<FieldVisit[]>>("/field-agents/me/visits", { params: query });
    return res.data.data;
  },
};

export const fieldVisitsApi = {
  list: async (query: FieldVisitsQuery = {}) => {
    const res = await api.get<PaginatedResponse<FieldVisit>>("/field-visits", { params: query });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<FieldVisit>>(`/field-visits/${id}`);
    return res.data.data;
  },

  schedule: async (data: {
    fieldAgentId: string;
    borrowerId: string;
    applicationId?: string;
    loanId?: string;
    purpose: string;
    scheduledDate: string;
    notes?: string;
  }) => {
    const res = await api.post<ApiResponse<FieldVisit>>("/field-visits", data);
    return res.data.data;
  },

  startVisit: async (id: string, latitude: number, longitude: number) => {
    const res = await api.patch<ApiResponse<FieldVisit>>(`/field-visits/${id}/start`, { latitude, longitude });
    return res.data.data;
  },

  completeVisit: async (id: string, data: {
    latitude: number;
    longitude: number;
    findings: string;
    recommendation: "APPROVE" | "REJECT" | "NEEDS_REVIEW";
    photos?: string[];
    signature?: string;
    borrowerPresent: boolean;
    farmVerified: boolean;
    notes?: string;
  }) => {
    const res = await api.patch<ApiResponse<FieldVisit>>(`/field-visits/${id}/complete`, data);
    return res.data.data;
  },

  cancel: async (id: string, reason: string) => {
    const res = await api.patch<ApiResponse<FieldVisit>>(`/field-visits/${id}/cancel`, { reason });
    return res.data.data;
  },

  reschedule: async (id: string, scheduledDate: string) => {
    const res = await api.patch<ApiResponse<FieldVisit>>(`/field-visits/${id}/reschedule`, { scheduledDate });
    return res.data.data;
  },
};
