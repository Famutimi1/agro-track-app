import { api, ApiResponse, PaginatedResponse } from "./client";
import { Loan } from "./loans";

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
  updatedAt?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    createdAt?: string;
  };
  cooperative?: { id: string; name: string };
  _count?: { loans: number };
  loans?: Loan[];
  farmReports?: FarmReport[];
  scoreHistory?: FarmScoreEntry[];
}

export interface FarmReport {
  id: string;
  borrowerId: string;
  cropStage: string;
  notes?: string;
  challenges?: string[];
  photoUrls?: string[];
  status: "PENDING" | "VERIFIED" | "REJECTED";
  verifiedById?: string;
  verifiedAt?: string;
  createdAt: string;
  verifiedBy?: {
    user: { firstName: string; lastName: string };
  };
}

export interface FarmScoreEntry {
  id: string;
  score: number;
  previousScore?: number;
  tier: string;
  components: Record<string, number>;
  calculatedAt: string;
}

export interface FarmScoreDetail {
  currentScore: number;
  tier: string;
  components: Record<string, number>;
  history: FarmScoreEntry[];
}

export interface BorrowerActivityEvent {
  type: string;
  date: string;
  title: string;
  description?: string;
  amount?: number;
}

export interface BorrowerDocument {
  id: string;
  borrowerId: string;
  type: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  verifiedAt?: string;
  createdAt: string;
}

export interface BorrowersQuery {
  page?: number;
  limit?: number;
  state?: string;
  search?: string;
  crop?: string;
  tier?: string;
  cooperativeId?: string;
  minFarmScore?: number;
  maxFarmScore?: number;
  sortBy?: "newest" | "oldest" | "highestScore" | "lowestScore" | "mostLoans";
}

export interface FlagBorrowerRequest {
  reason: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface BlacklistBorrowerRequest {
  reason: string;
  durationMonths: number | "PERMANENT";
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

  getLoans: async (id: string) => {
    const res = await api.get<ApiResponse<Loan[]>>(`/borrowers/${id}/loans`);
    return res.data.data;
  },

  getFarmReports: async (id: string) => {
    const res = await api.get<ApiResponse<FarmReport[]>>(`/borrowers/${id}/farm-reports`);
    return res.data.data;
  },

  getFarmScore: async (id: string) => {
    const res = await api.get<ApiResponse<FarmScoreDetail>>(`/borrowers/${id}/farmscore`);
    return res.data.data;
  },

  getDocuments: async (id: string) => {
    const res = await api.get<ApiResponse<BorrowerDocument[]>>(`/borrowers/${id}/documents`);
    return res.data.data;
  },

  getActivity: async (id: string) => {
    const res = await api.get<ApiResponse<BorrowerActivityEvent[]>>(`/borrowers/${id}/activity`);
    return res.data.data;
  },

  flag: async (id: string, data: FlagBorrowerRequest) => {
    const res = await api.post<ApiResponse<{ success: boolean; message: string }>>(`/borrowers/${id}/flag`, data);
    return res.data.data;
  },

  blacklist: async (id: string, data: BlacklistBorrowerRequest) => {
    const res = await api.post<ApiResponse<{ success: boolean }>>(`/borrowers/${id}/blacklist`, data);
    return res.data.data;
  },

  unblacklist: async (id: string, reason: string) => {
    const res = await api.post<ApiResponse<{ success: boolean }>>(`/borrowers/${id}/unblacklist`, { reason });
    return res.data.data;
  },

  // Borrower self-service endpoints
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

export const FARM_SCORE_TIERS: Record<string, { label: string; color: string; bg: string; min: number }> = {
  EXCELLENT: { label: "Excellent", color: "text-purple-600", bg: "bg-purple-100", min: 750 },
  GOOD: { label: "Good", color: "text-green-600", bg: "bg-green-100", min: 650 },
  FAIR: { label: "Fair", color: "text-yellow-600", bg: "bg-yellow-100", min: 500 },
  POOR: { label: "Poor", color: "text-orange-600", bg: "bg-orange-100", min: 350 },
  VERY_POOR: { label: "Very Poor", color: "text-red-600", bg: "bg-red-100", min: 0 },
};

export const FLAG_SEVERITIES = [
  { value: "LOW", label: "Low", description: "Internal note only", color: "text-blue-600" },
  { value: "MEDIUM", label: "Medium", description: "Applications require senior approval", color: "text-yellow-600" },
  { value: "HIGH", label: "High", description: "All applications on hold, alert to admin", color: "text-orange-600" },
  { value: "CRITICAL", label: "Critical", description: "Account suspended, disbursements blocked", color: "text-red-600" },
];
