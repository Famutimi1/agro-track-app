import { api, ApiResponse, PaginatedResponse } from "./client";

export type ReportType =
  | "PORTFOLIO_PERFORMANCE"
  | "STATE_BREAKDOWN"
  | "CROP_ANALYSIS"
  | "GENDER_DEMOGRAPHICS"
  | "DEFAULT_RISK"
  | "IMPACT_REPORT"
  | "FIELD_AGENT_ACTIVITY"
  | "AUDIT_EXPORT";

export interface Report {
  id: string;
  type: ReportType;
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

export interface ImpactMetrics {
  farmersFunded: number;
  hectaresFarmed: number;
  jobsCreated: number;
  estimatedYieldTonnes: number;
  fundUtilizationRate: number;
}

export interface ReportJob {
  id: string;
  type: ReportType;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  progress: number;
  downloadUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PortfolioReport {
  period: { startDate: string; endDate: string };
  portfolio: {
    totalLoans: number;
    activeLoans: number;
    totalDisbursed: number;
    totalRepaid: number;
    totalOutstanding: number;
    repaymentRate: number;
  };
  disbursements: { count: number; amount: number };
  repayments: { count: number; amount: number };
  applications: Record<string, number>;
  borrowers: { total: number };
  byProgram: Array<{
    programId: string;
    programName: string;
    loanCount: number;
    totalAmount: number;
  }>;
}

export interface StateBreakdownReport {
  period: { startDate: string; endDate: string };
  states: Array<{
    state: string;
    borrowerCount: number;
    loanCount: number;
    totalDisbursed: number;
    totalRepaid: number;
    repaymentRate: number;
  }>;
}

export interface CropAnalysisReport {
  period: { startDate: string; endDate: string };
  crops: Array<{
    crop: string;
    farmerCount: number;
    avgFarmScore: number;
    loanCount: number;
    totalDisbursed: number;
    repaymentRate: number;
  }>;
}

export interface GenderDemographicsReport {
  byGender: Array<{
    gender: string;
    count: number;
    avgFarmScore: number;
    avgFarmSize: number;
    totalLoaned: number;
    avgLoanSize: number;
  }>;
  byAge: Array<{
    ageGroup: string;
    count: number;
  }>;
}

export interface ImpactReport {
  period: { startDate: string; endDate: string };
  impact: {
    farmersFunded: number;
    hectaresFarmed: number;
    jobsCreated: number;
    estimatedYieldTonnes: number;
    loanCount: number;
    totalDisbursed: number;
    cooperativesSupported: number;
  };
}

export interface FieldAgentActivityReport {
  period: { startDate: string; endDate: string };
  agents: Array<{
    agentCode: string;
    name: string;
    state: string;
    registrations: number;
    verifications: number;
    visitsInPeriod: number;
    rating: number;
    totalEarnings: number;
    active: boolean;
  }>;
  summary: {
    totalAgents: number;
    activeAgents: number;
    totalVisits: number;
    avgRating: number;
  };
}

export interface OverdueReport {
  summary: {
    totalOverdueCount: number;
    totalOverdueAmount: number;
  };
  byAgeBracket: Record<
    string,
    Array<{
      borrower: { name: string; phone: string; farmerId: string };
      program: string;
      amount: number;
      dueDate: string;
      daysOverdue: number;
    }>
  >;
}

export interface AuditExportReport {
  period: { startDate: string; endDate: string };
  totalRecords: number;
  logs: Array<{
    id: string;
    timestamp: string;
    user: string;
    userEmail?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details: Record<string, any>;
  }>;
}

export interface GenerateReportOptions {
  type: ReportType;
  dateFrom?: string;
  dateTo?: string;
  format?: "PDF" | "CSV" | "XLSX";
  filters?: Record<string, any>;
}

export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
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

  getImpactMetrics: async () => {
    const res = await api.get<ApiResponse<ImpactMetrics>>("/reports/impact");
    return res.data.data;
  },

  generateReport: async (options: GenerateReportOptions) => {
    const res = await api.post<ApiResponse<{ jobId: string }>>("/reports/generate", options);
    return res.data.data;
  },

  getJobStatus: async (jobId: string) => {
    const res = await api.get<ApiResponse<ReportJob>>(`/reports/jobs/${jobId}`);
    return res.data.data;
  },

  getPortfolioReport: async (query: DateRangeQuery = {}) => {
    const res = await api.get<ApiResponse<PortfolioReport>>("/reports/portfolio", { params: query });
    return res.data.data;
  },

  getStateBreakdownReport: async (query: DateRangeQuery = {}) => {
    const res = await api.get<ApiResponse<StateBreakdownReport>>("/reports/state-breakdown", { params: query });
    return res.data.data;
  },

  getCropAnalysisReport: async (query: DateRangeQuery = {}) => {
    const res = await api.get<ApiResponse<CropAnalysisReport>>("/reports/crop-analysis", { params: query });
    return res.data.data;
  },

  getGenderDemographicsReport: async () => {
    const res = await api.get<ApiResponse<GenderDemographicsReport>>("/reports/gender-demographics");
    return res.data.data;
  },

  getOverdueReport: async () => {
    const res = await api.get<ApiResponse<OverdueReport>>("/reports/overdue");
    return res.data.data;
  },

  getImpactReport: async (query: DateRangeQuery = {}) => {
    const res = await api.get<ApiResponse<ImpactReport>>("/reports/impact-report", { params: query });
    return res.data.data;
  },

  getFieldAgentActivityReport: async (query: DateRangeQuery = {}) => {
    const res = await api.get<ApiResponse<FieldAgentActivityReport>>("/reports/field-agents", { params: query });
    return res.data.data;
  },

  getAuditExport: async (query: DateRangeQuery = {}) => {
    const res = await api.get<ApiResponse<AuditExportReport>>("/reports/audit", { params: query });
    return res.data.data;
  },

  getProgramReport: async (programId: string, query: DateRangeQuery = {}) => {
    const res = await api.get<ApiResponse<any>>(`/reports/program/${programId}`, { params: query });
    return res.data.data;
  },

  getBorrowerStatement: async (borrowerId: string, query: DateRangeQuery = {}) => {
    const res = await api.get<ApiResponse<any>>(`/reports/borrower/${borrowerId}/statement`, { params: query });
    return res.data.data;
  },
};

export const REPORT_TYPES: Array<{
  type: ReportType;
  name: string;
  description: string;
  icon: string;
  color: string;
}> = [
  {
    type: "PORTFOLIO_PERFORMANCE",
    name: "Portfolio Performance",
    description: "Overall loan portfolio metrics including disbursements, repayments, and performance trends",
    icon: "TrendingUp",
    color: "blue",
  },
  {
    type: "STATE_BREAKDOWN",
    name: "State Breakdown",
    description: "Geographic distribution of loans and repayments across Nigerian states",
    icon: "MapPin",
    color: "green",
  },
  {
    type: "CROP_ANALYSIS",
    name: "Crop Analysis",
    description: "Loan performance segmented by primary crop type with yield estimates",
    icon: "Wheat",
    color: "amber",
  },
  {
    type: "GENDER_DEMOGRAPHICS",
    name: "Gender & Demographics",
    description: "Borrower demographics including gender ratios and age distribution",
    icon: "Users",
    color: "purple",
  },
  {
    type: "DEFAULT_RISK",
    name: "Default Risk",
    description: "Overdue and at-risk loans with aging analysis",
    icon: "AlertTriangle",
    color: "red",
  },
  {
    type: "IMPACT_REPORT",
    name: "Impact Report",
    description: "Social impact metrics: farmers funded, jobs created, hectares farmed",
    icon: "Heart",
    color: "pink",
  },
  {
    type: "FIELD_AGENT_ACTIVITY",
    name: "Field Agent Activity",
    description: "Agent performance metrics including visits, verifications, and ratings",
    icon: "UserCheck",
    color: "cyan",
  },
  {
    type: "AUDIT_EXPORT",
    name: "Audit Trail Export",
    description: "Complete audit log of all actions taken on the platform",
    icon: "FileText",
    color: "gray",
  },
];
