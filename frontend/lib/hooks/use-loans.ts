import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loansApi, disbursementsApi, repaymentsApi, LoansQuery } from "../api";

export const loanKeys = {
  all: ["loans"] as const,
  lists: () => [...loanKeys.all, "list"] as const,
  list: (query: LoansQuery) => [...loanKeys.lists(), query] as const,
  mine: () => [...loanKeys.all, "mine"] as const,
  details: () => [...loanKeys.all, "detail"] as const,
  detail: (id: string) => [...loanKeys.details(), id] as const,
};

export const disbursementKeys = {
  all: ["disbursements"] as const,
  lists: () => [...disbursementKeys.all, "list"] as const,
  list: (query: Record<string, any>) => [...disbursementKeys.lists(), query] as const,
  byLoan: (loanId: string) => [...disbursementKeys.all, "loan", loanId] as const,
  tranches: (loanId: string) => [...disbursementKeys.all, "tranches", loanId] as const,
};

export const repaymentKeys = {
  all: ["repayments"] as const,
  lists: () => [...repaymentKeys.all, "list"] as const,
  list: (query: Record<string, any>) => [...repaymentKeys.lists(), query] as const,
  mine: () => [...repaymentKeys.all, "mine"] as const,
};

// Loan hooks
export function useLoans(query: LoansQuery = {}) {
  return useQuery({
    queryKey: loanKeys.list(query),
    queryFn: () => loansApi.listForLender(query),
  });
}

export function useMyLoans(query: LoansQuery = {}) {
  return useQuery({
    queryKey: loanKeys.mine(),
    queryFn: () => loansApi.listMine(query),
  });
}

export function useLoan(id: string) {
  return useQuery({
    queryKey: loanKeys.detail(id),
    queryFn: () => loansApi.getById(id),
    enabled: !!id,
  });
}

// Disbursement hooks
export function useDisbursements(query: Parameters<typeof disbursementsApi.list>[0] = {}) {
  return useQuery({
    queryKey: disbursementKeys.list(query),
    queryFn: () => disbursementsApi.list(query),
  });
}

export function useLoanDisbursements(loanId: string) {
  return useQuery({
    queryKey: disbursementKeys.byLoan(loanId),
    queryFn: () => disbursementsApi.getByLoan(loanId),
    enabled: !!loanId,
  });
}

export function useTrancheStatus(loanId: string) {
  return useQuery({
    queryKey: disbursementKeys.tranches(loanId),
    queryFn: () => disbursementsApi.getTrancheStatus(loanId),
    enabled: !!loanId,
  });
}

export function useApproveDisbursement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => disbursementsApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disbursementKeys.lists() });
    },
  });
}

export function useProcessDisbursement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paymentRef }: { id: string; paymentRef: string }) =>
      disbursementsApi.process(id, paymentRef),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disbursementKeys.lists() });
    },
  });
}

// Repayment hooks
export function useRepayments(query: Parameters<typeof repaymentsApi.list>[0] = {}) {
  return useQuery({
    queryKey: repaymentKeys.list(query),
    queryFn: () => repaymentsApi.list(query),
  });
}

export function useMyRepayments() {
  return useQuery({
    queryKey: repaymentKeys.mine(),
    queryFn: () => repaymentsApi.listMine(),
  });
}

export function useRecordRepayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, amount, method, paymentRef }: { id: string; amount: number; method: string; paymentRef: string }) =>
      repaymentsApi.record(id, amount, method, paymentRef),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: repaymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: repaymentKeys.mine() });
      queryClient.invalidateQueries({ queryKey: loanKeys.all });
    },
  });
}
