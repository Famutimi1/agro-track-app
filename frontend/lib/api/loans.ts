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
  borrower?: {
    farmerId: string;
    user: { firstName: string; lastName: string; phone: string };
  };
  program?: { name: string };
  disbursements?: Disbursement[];
  repayments?: Repayment[];
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

export interface LoansQuery {
  page?: number;
  limit?: number;
  status?: string;
  programId?: string;
}

export const loansApi = {
  // Borrower endpoints
  listMine: async (query: LoansQuery = {}) => {
    const res = await api.get<PaginatedResponse<Loan>>("/borrowers/me/loans", { params: query });
    return res.data;
  },

  // Lender endpoints - through borrowers
  listForLender: async (query: LoansQuery = {}) => {
    const res = await api.get<PaginatedResponse<Loan>>("/borrowers/loans", { params: query });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Loan>>(`/borrowers/loans/${id}`);
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

export const repaymentsApi = {
  list: async (query: { page?: number; limit?: number; status?: string } = {}) => {
    const res = await api.get<PaginatedResponse<Repayment>>("/repayments", { params: query });
    return res.data;
  },

  listMine: async () => {
    const res = await api.get<ApiResponse<Repayment[]>>("/repayments/me");
    return res.data.data;
  },

  record: async (id: string, amount: number, method: string, paymentRef: string) => {
    const res = await api.patch<ApiResponse<Repayment>>(`/repayments/${id}/pay`, { amount, method, paymentRef });
    return res.data.data;
  },
};
