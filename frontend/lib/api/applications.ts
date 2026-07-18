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
  daysInQueue?: number;
  program?: {
    name: string;
    lenderOrg?: { name: string };
    requiredDocuments?: string[];
    interestRate?: number;
    durationMonths?: number;
    trancheCount?: number;
    disbursementType?: string;
  };
  borrower?: {
    id: string;
    farmerId: string;
    state: string;
    lga: string;
    farmSizeHa: number;
    primaryCrop: string;
    secondaryCrops?: string[];
    farmScore: number;
    farmScoreTier: string;
    bvnVerified: boolean;
    ninVerified: boolean;
    farmLatitude?: number;
    farmLongitude?: number;
    bankName?: string;
    bankAccount?: string;
    cooperative?: { id: string; name: string };
    scoreHistory?: Array<{
      score: number;
      previousScore?: number;
      tier: string;
      components: any;
      calculatedAt: string;
    }>;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      avatarUrl?: string;
    };
  };
  documents?: Array<{
    id: string;
    type: string;
    fileName: string;
    fileUrl: string;
    status: string;
    verifiedAt?: string;
    createdAt: string;
  }>;
}

export interface CreateApplicationRequest {
  programId: string;
  amount: number;
  purpose?: string;
}

export interface ApproveApplicationRequest {
  reviewNotes?: string;
  approvedAmount?: number;
}

export type RejectionCode =
  | "INSUFFICIENT_SCORE"
  | "UNVERIFIED_IDENTITY"
  | "INCOMPLETE_DOCUMENTS"
  | "FARM_NOT_VERIFIED"
  | "OUTSIDE_ELIGIBILITY"
  | "PROGRAM_FUNDS_EXHAUSTED"
  | "DUPLICATE_APPLICATION"
  | "SUSPICIOUS_ACTIVITY"
  | "OTHER";

export interface RejectApplicationRequest {
  reason: string;
  rejectionCode: RejectionCode;
}

export interface RequestInfoRequest {
  requiredItems: string[];
  message: string;
}

export interface BulkActionRequest {
  applicationIds: string[];
  action: "APPROVE" | "REJECT" | "ASSIGN";
  rejectionCode?: RejectionCode;
  rejectionReason?: string;
  assigneeId?: string;
}

export interface BulkActionResult {
  successful: string[];
  failed: Array<{ id: string; error: string }>;
}

export interface ApplicationsQuery {
  page?: number;
  limit?: number;
  status?: string;
  programId?: string;
  state?: string;
  minFarmScore?: number;
  maxFarmScore?: number;
  agentVerified?: "true" | "false";
  sortBy?: "newest" | "oldest" | "highestScore" | "highestAmount";
  search?: string;
}

// Legacy interface kept for backward compatibility
export interface ReviewApplicationRequest {
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
  notes?: string;
}

export interface EligibilityCheck {
  key: string;
  label: string;
  pass: boolean;
  detail: string;
}

export interface EligibilityResult {
  eligible: boolean;
  checks: EligibilityCheck[];
}

export const applicationsApi = {
  // ─── Borrower Endpoints ──────────────────────────────────────────────────────

  create: async (data: CreateApplicationRequest) => {
    const res = await api.post<ApiResponse<Application>>("/applications", data);
    return res.data.data;
  },

  getEligibility: async (programId: string, amount?: number) => {
    const res = await api.get<ApiResponse<EligibilityResult>>(`/applications/eligibility/${programId}`, {
      params: amount ? { amount } : undefined,
    });
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

  uploadDocuments: async (id: string, files: File[], type?: string) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("documents", file));
    if (type) formData.append("type", type);
    const res = await api.post<ApiResponse<Application["documents"]>>(
      `/applications/${id}/documents`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.data;
  },

  respondInfo: async (id: string, message?: string) => {
    const res = await api.post<ApiResponse<Application>>(`/applications/${id}/respond-info`, { message });
    return res.data.data;
  },

  // ─── Lender Endpoints ────────────────────────────────────────────────────────

  list: async (query: ApplicationsQuery = {}) => {
    const res = await api.get<PaginatedResponse<Application>>("/applications", { params: query });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Application>>(`/applications/${id}`);
    return res.data.data;
  },

  approve: async (id: string, data: ApproveApplicationRequest = {}) => {
    const res = await api.post<ApiResponse<Application>>(`/applications/${id}/approve`, data);
    return res.data.data;
  },

  reject: async (id: string, data: RejectApplicationRequest) => {
    const res = await api.post<ApiResponse<Application>>(`/applications/${id}/reject`, data);
    return res.data.data;
  },

  requestInfo: async (id: string, data: RequestInfoRequest) => {
    const res = await api.post<ApiResponse<Application>>(`/applications/${id}/request-info`, data);
    return res.data.data;
  },

  markUnderReview: async (id: string) => {
    const res = await api.patch<ApiResponse<Application>>(`/applications/${id}/under-review`);
    return res.data.data;
  },

  bulkAction: async (data: BulkActionRequest) => {
    const res = await api.post<ApiResponse<BulkActionResult>>("/applications/bulk", data);
    return res.data.data;
  },

  // Legacy endpoint kept for backward compatibility
  review: async (id: string, approved: boolean, notes?: string) => {
    const data: ReviewApplicationRequest = {
      status: approved ? "APPROVED" : "REJECTED",
      notes,
    };
    const res = await api.patch<ApiResponse<Application>>(`/applications/${id}/review`, data);
    return res.data.data;
  },
};

export const REJECTION_CODES: { code: RejectionCode; label: string; description: string }[] = [
  { code: "INSUFFICIENT_SCORE", label: "Insufficient Score", description: "FarmScore below program minimum" },
  { code: "UNVERIFIED_IDENTITY", label: "Unverified Identity", description: "BVN or NIN verification failed" },
  { code: "INCOMPLETE_DOCUMENTS", label: "Incomplete Documents", description: "Missing required documents" },
  { code: "FARM_NOT_VERIFIED", label: "Farm Not Verified", description: "Field agent verification incomplete" },
  { code: "OUTSIDE_ELIGIBILITY", label: "Outside Eligibility", description: "Does not meet crop/location/age criteria" },
  { code: "PROGRAM_FUNDS_EXHAUSTED", label: "Program Funds Exhausted", description: "Loan pool fully deployed" },
  { code: "DUPLICATE_APPLICATION", label: "Duplicate Application", description: "Active application already exists" },
  { code: "SUSPICIOUS_ACTIVITY", label: "Suspicious Activity", description: "Fraud flag raised" },
  { code: "OTHER", label: "Other", description: "Other reason" },
];

export const INFO_REQUEST_ITEMS = [
  "Clearer farm photos (geotagged)",
  "Bank statement (last 3 months)",
  "Cooperative membership letter",
  "Land title document",
  "Farm registration certificate",
  "ID card photo",
  "Utility bill for address verification",
];
