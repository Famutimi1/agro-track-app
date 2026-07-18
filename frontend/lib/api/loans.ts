import { api, ApiResponse, PaginatedResponse } from "./client";

export interface Loan {
  id: string;
  borrowerId: string;
  programId: string;
  applicationId?: string;
  amount: number;
  interestRate: number;
  totalRepayable: number;
  amountPaid: number;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "DEFAULTED" | "CANCELLED";
  trancheCount: number;
  currentTranche: number;
  startDate?: string;
  endDate?: string;
  nextPaymentDate?: string;
  createdAt: string;
  updatedAt: string;
  totalDisbursed?: number;
  totalRepaid?: number;
  outstandingBalance?: number;
  disbursementProgress?: number;
  nextPaymentDue?: string | null;
  nextPaymentAmount?: number | null;
  daysToNextPayment?: number | null;
  borrower?: {
    id: string;
    farmerId: string;
    state: string;
    lga: string;
    farmScore: number;
    farmScoreTier: string;
    user: {
      firstName: string;
      lastName: string;
      phone?: string;
      email: string;
      avatarUrl?: string;
    };
    cooperative?: { id: string; name: string };
  };
  program?: {
    id: string;
    name: string;
    interestRate: number;
    durationMonths: number;
  };
  application?: {
    id: string;
    farmScoreAtApply: number;
    submittedAt: string;
  };
  disbursements?: Disbursement[];
  repayments?: RepaymentScheduleItem[];
}

export interface Disbursement {
  id: string;
  loanId: string;
  trancheNumber: number;
  amount: number;
  status: "PENDING" | "APPROVED" | "PROCESSING" | "COMPLETED" | "FAILED";
  approvedBy?: string;
  approvedAt?: string;
  paymentRef?: string;
  processedAt?: string;
  failureReason?: string;
  createdAt: string;
}

export interface Repayment {
  id: string;
  loanId: string;
  amount: number;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE" | "PARTIAL";
  paidAmount?: number;
  paidAt?: string;
  paymentMethod?: string;
  paymentRef?: string;
  penaltyAmount?: number;
  createdAt: string;
}

export interface RepaymentScheduleItem extends Repayment {
  installmentNumber: number;
  daysLate: number;
}

export interface LoanStats {
  totalLoans: number;
  totalDisbursed: number;
  totalRepaid: number;
  totalOutstanding: number;
  activeLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  avgRepaymentRate: number;
}

export interface TimelineEvent {
  type: string;
  date: string;
  title: string;
  description?: string;
  amount?: number;
  reference?: string;
}

export interface LoansQuery {
  page?: number;
  limit?: number;
  status?: string;
  programId?: string;
  state?: string;
  borrowerId?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: "newest" | "oldest" | "highestAmount" | "lowestAmount" | "nextPayment";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface RestructureRequest {
  reason: string;
  extensionMonths: number;
  newMonthlyAmount: number;
  gracePeriodMonths?: number;
}

export interface WriteOffRequest {
  reason: string;
  writeOffAmount: number;
}

export const loansApi = {
  // Borrower endpoints
  listMine: async (query: LoansQuery = {}) => {
    const res = await api.get<PaginatedResponse<Loan>>("/borrowers/me/loans", { params: query });
    return res.data;
  },

  // Lender endpoints
  list: async (query: LoansQuery = {}) => {
    const res = await api.get<PaginatedResponse<Loan>>("/loans", { params: query });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Loan>>(`/loans/${id}`);
    return res.data.data;
  },

  getRepaymentSchedule: async (id: string) => {
    const res = await api.get<ApiResponse<RepaymentScheduleItem[]>>(`/loans/${id}/repayment-schedule`);
    return res.data.data;
  },

  getTimeline: async (id: string) => {
    const res = await api.get<ApiResponse<TimelineEvent[]>>(`/loans/${id}/timeline`);
    return res.data.data;
  },

  getStats: async () => {
    const res = await api.get<ApiResponse<LoanStats>>("/loans/stats");
    return res.data.data;
  },

  restructure: async (id: string, data: RestructureRequest) => {
    const res = await api.post<ApiResponse<Loan>>(`/loans/${id}/restructure`, data);
    return res.data.data;
  },

  writeOff: async (id: string, data: WriteOffRequest) => {
    const res = await api.post<ApiResponse<Loan>>(`/loans/${id}/write-off`, data);
    return res.data.data;
  },
};

export const disbursementsApi = {
  list: async (query: { page?: number; limit?: number; status?: string } = {}) => {
    const res = await api.get<PaginatedResponse<Disbursement>>("/disbursements", { params: query });
    return res.data;
  },

  getByLoan: async (loanId: string) => {
    const res = await api.get<ApiResponse<Disbursement[]>>(`/disbursements/loan/${loanId}`);
    return res.data.data;
  },

  approve: async (id: string) => {
    const res = await api.patch<ApiResponse<Disbursement>>(`/disbursements/${id}/approve`);
    return res.data.data;
  },

  process: async (id: string, paymentRef: string) => {
    const res = await api.patch<ApiResponse<Disbursement>>(`/disbursements/${id}/process`, { paymentRef });
    return res.data.data;
  },

  reject: async (id: string, reason: string) => {
    const res = await api.patch<ApiResponse<Disbursement>>(`/disbursements/${id}/reject`, { reason });
    return res.data.data;
  },

  getTrancheStatus: async (loanId: string) => {
    const res = await api.get<ApiResponse<{
      loanId: string;
      totalTranches: number;
      currentTranche: number;
      totalAmount: number;
      totalDisbursed: number;
      remaining: number;
      tranches: Disbursement[];
    }>>(`/disbursements/loan/${loanId}/tranches`);
    return res.data.data;
  },
};

export interface CardPaymentInit {
  authorizationUrl: string;
  reference: string;
}

export interface BankTransferInit {
  reference: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
}

export interface UssdInit {
  reference: string;
  ussdCode: string;
}

export interface InKindDeclaration {
  produceType: string;
  quantityKg: number;
  deliveryLocation: string;
}

export const repaymentsApi = {
  list: async (query: { page?: number; limit?: number; status?: string } = {}) => {
    const res = await api.get<PaginatedResponse<Repayment>>("/repayments", { params: query });
    return res.data;
  },

  listMine: async () => {
    const res = await api.get<ApiResponse<Repayment[]>>("/repayments/me");
    return res.data.data;
  },

  record: async (id: string, amount: number, method: string) => {
    const res = await api.post<ApiResponse<Repayment>>(`/repayments/${id}/pay`, { amount, method });
    return res.data.data;
  },

  initiateCard: async (id: string) => {
    const res = await api.post<ApiResponse<CardPaymentInit>>(`/repayments/${id}/initiate-card`);
    return res.data.data;
  },

  verifyCard: async (id: string, reference: string) => {
    const res = await api.post<ApiResponse<Repayment>>(`/repayments/${id}/verify-card`, { reference });
    return res.data.data;
  },

  verifyCardByReference: async (reference: string) => {
    const res = await api.get<ApiResponse<Repayment>>("/repayments/verify-card", { params: { reference } });
    return res.data.data;
  },

  initiateBankTransfer: async (id: string) => {
    const res = await api.post<ApiResponse<BankTransferInit>>(`/repayments/${id}/initiate-bank-transfer`);
    return res.data.data;
  },

  initiateUssd: async (id: string) => {
    const res = await api.post<ApiResponse<UssdInit>>(`/repayments/${id}/initiate-ussd`);
    return res.data.data;
  },

  confirmManual: async (id: string, method: "BANK_TRANSFER" | "USSD") => {
    const res = await api.post<ApiResponse<Repayment>>(`/repayments/${id}/confirm-manual`, { method });
    return res.data.data;
  },

  declareInKind: async (id: string, data: InKindDeclaration) => {
    const res = await api.post<ApiResponse<Repayment>>(`/repayments/${id}/in-kind`, data);
    return res.data.data;
  },
};

export const RESTRUCTURE_REASONS = [
  "Flood damage to crops",
  "Drought conditions",
  "Pest infestation",
  "Crop disease outbreak",
  "Illness or family emergency",
  "Market price collapse",
  "Delayed harvest",
  "Other",
];
