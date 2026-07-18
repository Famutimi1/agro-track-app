import { api, ApiResponse } from "./client";

export type BorrowerStatus = "ACTIVE" | "AT_RISK" | "DEFAULTING" | "COMPLETED" | "PENDING";

export interface BorrowerLocation {
  id: string;
  farmerId: string;
  name: string;
  lat: number;
  lng: number;
  state: string;
  lga: string;
  farmScore: number;
  farmScoreTier: string;
  status: BorrowerStatus;
  loanAmount: number;
  primaryCrop: string;
  cooperative?: string;
}

export interface StateStats {
  state: string;
  borrowerCount: number;
  totalDisbursed: number;
  repaymentRate: number;
  avgFarmScore: number;
  atRiskCount: number;
  defaultingCount: number;
}

export interface HeatmapPoint {
  state: string;
  lat: number;
  lng: number;
  value: number;
}

export interface MapSummary {
  totalBorrowers: number;
  statesWithBorrowers: number;
  loanStatuses: Record<string, number>;
}

export interface FieldAgentZone {
  id: string;
  agentCode: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  registrations: number;
  verifications: number;
  rating: number;
}

export interface MapFilters {
  programId?: string;
  status?: BorrowerStatus;
  state?: string;
  minFarmScore?: number;
  maxFarmScore?: number;
  crop?: string;
  cooperativeId?: string;
}

export const mapApi = {
  getBorrowerLocations: async (filters: MapFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.programId) params.append("programId", filters.programId);
    if (filters.status) params.append("status", filters.status);
    if (filters.state) params.append("state", filters.state);
    if (filters.minFarmScore !== undefined) params.append("minFarmScore", String(filters.minFarmScore));
    if (filters.maxFarmScore !== undefined) params.append("maxFarmScore", String(filters.maxFarmScore));
    if (filters.crop) params.append("crop", filters.crop);
    if (filters.cooperativeId) params.append("cooperativeId", filters.cooperativeId);

    const res = await api.get<ApiResponse<BorrowerLocation[]>>(`/map/borrowers?${params.toString()}`);
    return res.data.data;
  },

  getStateStats: async () => {
    const res = await api.get<ApiResponse<StateStats[]>>("/map/states");
    return res.data.data;
  },

  getHeatmapData: async (metric: "repayment" | "farmScore" | "density" = "density") => {
    const res = await api.get<ApiResponse<HeatmapPoint[]>>(`/map/heatmap?metric=${metric}`);
    return res.data.data;
  },

  getSummary: async () => {
    const res = await api.get<ApiResponse<MapSummary>>("/map/summary");
    return res.data.data;
  },

  getFieldAgentZones: async () => {
    const res = await api.get<ApiResponse<FieldAgentZone[]>>("/map/agents");
    return res.data.data;
  },

  getCrops: async () => {
    const res = await api.get<ApiResponse<string[]>>("/map/crops");
    return res.data.data;
  },
};

export const STATUS_COLORS: Record<BorrowerStatus, { color: string; label: string; bg: string }> = {
  ACTIVE: { color: "#16a34a", label: "Active", bg: "bg-green-100" },
  AT_RISK: { color: "#d97706", label: "At Risk", bg: "bg-amber-100" },
  DEFAULTING: { color: "#dc2626", label: "Defaulting", bg: "bg-red-100" },
  COMPLETED: { color: "#2563eb", label: "Completed", bg: "bg-blue-100" },
  PENDING: { color: "#6b7280", label: "Pending", bg: "bg-gray-100" },
};

export const NIGERIA_CENTER = { lat: 9.0820, lng: 8.6753 };
export const NIGERIA_BOUNDS = {
  north: 13.8856,
  south: 4.2719,
  west: 2.6769,
  east: 14.6800,
};
