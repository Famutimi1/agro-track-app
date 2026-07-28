import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  applicationsApi,
  CreateApplicationRequest,
  ApproveApplicationRequest,
  RejectApplicationRequest,
  RequestInfoRequest,
  BulkActionRequest,
} from "../api";

export const applicationKeys = {
  all: ["applications"] as const,
  lists: () => [...applicationKeys.all, "list"] as const,
  list: (query: Record<string, any>) => [...applicationKeys.lists(), query] as const,
  mine: () => [...applicationKeys.all, "mine"] as const,
  details: () => [...applicationKeys.all, "detail"] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
  eligibility: (programId: string, amount?: number) =>
    [...applicationKeys.all, "eligibility", programId, amount] as const,
};

export function useApplicationEligibility(programId: string, amount?: number) {
  return useQuery({
    queryKey: applicationKeys.eligibility(programId, amount),
    queryFn: () => applicationsApi.getEligibility(programId, amount),
    enabled: !!programId,
  });
}

export function useApplications(query: Parameters<typeof applicationsApi.list>[0] = {}) {
  return useQuery({
    queryKey: applicationKeys.list(query),
    queryFn: () => applicationsApi.list(query),
  });
}

export function useMyApplications() {
  return useQuery({
    queryKey: applicationKeys.mine(),
    queryFn: () => applicationsApi.listMine(),
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => applicationsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApplicationRequest) => applicationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.mine() });
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { amount?: number; purpose?: string } }) =>
      applicationsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.mine() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
    },
  });
}

export function useSubmitApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => applicationsApi.submit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.mine() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
    },
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => applicationsApi.withdraw(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.mine() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
    },
  });
}

export function useReviewApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, approved, notes }: { id: string; approved: boolean; notes?: string }) =>
      applicationsApi.review(id, approved, notes),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
    },
  });
}

export function useApproveApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApproveApplicationRequest }) =>
      applicationsApi.approve(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
    },
  });
}

export function useRejectApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectApplicationRequest }) =>
      applicationsApi.reject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
    },
  });
}

export function useRequestInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RequestInfoRequest }) =>
      applicationsApi.requestInfo(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
    },
  });
}

export function useBulkAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkActionRequest) => applicationsApi.bulkAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

export function useMarkUnderReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => applicationsApi.markUnderReview(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
    },
  });
}

export function useUploadApplicationDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, files, type }: { id: string; files: File[]; type?: string }) =>
      applicationsApi.uploadDocuments(id, files, type),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
    },
  });
}

export function useRespondToInfoRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, message }: { id: string; message?: string }) =>
      applicationsApi.respondInfo(id, message),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.mine() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
    },
  });
}
