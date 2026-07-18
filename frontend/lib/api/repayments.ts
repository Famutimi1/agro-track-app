import { api, ApiResponse, PaginatedResponse } from "./client";

export interface Repayment {
  id: string;
  loanId: string;
  amount: number;
  dueDate: string;
  status: "PENDING" | "PAID" | "LATE" | "OVERDUE" | "DEFAULTED" | "WAIVED";
  paidAmount?: number;
  paidAt?: string;
  paymentMethod?: string;
  paymentRef?: string;
  transactionId?: string;
  penaltyAmount?: number;
  createdAt: string;
  updatedAt: string;
  daysLate?: number;
  daysUntilDue?: number;
  loan: {
    id: string;
    borrower: {
      id: string;
      farmerId?: string;
      user: {
        firstName: string;
        lastName: string;
        phone?: string;
      };
    };
    program: {
      id: string;
      name: string;
    };
  };
}

export interface RepaymentStats {
  collectedThisMonth: { amount: number; count: number };
  onTimeRate: number;
  overdueBalance: number;
  overdueCount: number;
  methodBreakdown: Array<{ method: string; count: number; percentage: number }>;
  monthlyTrend: Array<{ month: string; onTime: number; late: number; defaulted: number }>;
}

export interface RepaymentsQuery {
  page?: number;
  limit?: number;
  status?: string;
  programId?: string;
  state?: string;
  method?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface RecordPaymentRequest {
  amount: number;
  method: string;
  reference?: string;
  paidAt?: string;
  receiptUrl?: string;
}

export const repaymentsApi = {
  list: async (query: RepaymentsQuery = {}) => {
    const res = await api.get<PaginatedResponse<Repayment>>("/repayments", { params: query });
    return res.data;
  },

  getOverdue: async (query: { page?: number; limit?: number } = {}) => {
    const res = await api.get<PaginatedResponse<Repayment>>("/repayments/overdue", { params: query });
    return res.data;
  },

  getScheduled: async (query: { page?: number; limit?: number; days?: number } = {}) => {
    const res = await api.get<PaginatedResponse<Repayment>>("/repayments/scheduled", { params: query });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Repayment>>(`/repayments/${id}`);
    return res.data.data;
  },

  getStats: async () => {
    const res = await api.get<ApiResponse<RepaymentStats>>("/repayments/stats");
    return res.data.data;
  },

  recordPayment: async (id: string, data: RecordPaymentRequest) => {
    const res = await api.post<ApiResponse<Repayment>>(`/repayments/${id}/pay`, data);
    return res.data.data;
  },

  waive: async (id: string, reason: string, waivedAmount?: number) => {
    const res = await api.post<ApiResponse<Repayment>>(`/repayments/${id}/waive`, {
      reason,
      waivedAmount,
    });
    return res.data.data;
  },

  markDefaulted: async (id: string) => {
    const res = await api.post<ApiResponse<Repayment>>(`/repayments/${id}/default`);
    return res.data.data;
  },

  reverse: async (id: string, reason: string) => {
    const res = await api.post<ApiResponse<Repayment>>(`/repayments/${id}/reverse`, { reason });
    return res.data.data;
  },

  sendReminders: async (borrowerIds: string[], channels: string[], message?: string) => {
    const res = await api.post<ApiResponse<{ sent: number; total: number }>>("/repayments/remind", {
      borrowerIds,
      channels,
      message,
    });
    return res.data.data;
  },

  // Borrower self-service
  getMyRepayments: async () => {
    const res = await api.get<ApiResponse<Repayment[]>>("/repayments/me");
    return res.data.data;
  },
};

export const REPAYMENT_STATUSES = [
  { value: "PENDING", label: "Scheduled", color: "text-gray-600", bg: "bg-gray-100" },
  { value: "PAID", label: "Paid", color: "text-green-600", bg: "bg-green-100" },
  { value: "LATE", label: "Late", color: "text-yellow-600", bg: "bg-yellow-100" },
  { value: "OVERDUE", label: "Overdue", color: "text-orange-600", bg: "bg-orange-100" },
  { value: "DEFAULTED", label: "Defaulted", color: "text-red-600", bg: "bg-red-100" },
  { value: "WAIVED", label: "Waived", color: "text-blue-600", bg: "bg-blue-100" },
];

export const PAYMENT_METHODS = [
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "MOBILE_MONEY", label: "Mobile Money" },
  { value: "USSD", label: "USSD" },
  { value: "CARD", label: "Card" },
  { value: "CASH", label: "Cash" },
  { value: "IN_KIND", label: "In-Kind (Produce)" },
];

export const WAIVER_REASONS = [
  { value: "COMPASSIONATE", label: "Compassionate (Death, Health)" },
  { value: "CROP_FAILURE", label: "Crop Failure (Natural Disaster)" },
  { value: "GOVERNMENT_DIRECTIVE", label: "Government Directive" },
  { value: "CALCULATION_ERROR", label: "Calculation Error" },
  { value: "OTHER", label: "Other" },
];
