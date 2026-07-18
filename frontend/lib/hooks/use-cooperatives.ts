import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cooperativesApi, CooperativesQuery } from "../api";

export const cooperativeKeys = {
  all: ["cooperatives"] as const,
  lists: () => [...cooperativeKeys.all, "list"] as const,
  list: (query: CooperativesQuery) => [...cooperativeKeys.lists(), query] as const,
  details: () => [...cooperativeKeys.all, "detail"] as const,
  detail: (id: string) => [...cooperativeKeys.details(), id] as const,
  members: (id: string) => [...cooperativeKeys.all, "members", id] as const,
  stats: (id: string) => [...cooperativeKeys.all, "stats", id] as const,
  score: (id: string) => [...cooperativeKeys.all, "score", id] as const,
  loans: (id: string) => [...cooperativeKeys.all, "loans", id] as const,
};

export function useCooperatives(query: CooperativesQuery = {}) {
  return useQuery({
    queryKey: cooperativeKeys.list(query),
    queryFn: () => cooperativesApi.list(query),
  });
}

export function useCooperative(id: string) {
  return useQuery({
    queryKey: cooperativeKeys.detail(id),
    queryFn: () => cooperativesApi.getById(id),
    enabled: !!id,
  });
}

export function useCooperativeMembers(id: string, query: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: cooperativeKeys.members(id),
    queryFn: () => cooperativesApi.getMembers(id, query),
    enabled: !!id,
  });
}

export function useCooperativeStats(id: string) {
  return useQuery({
    queryKey: cooperativeKeys.stats(id),
    queryFn: () => cooperativesApi.getStats(id),
    enabled: !!id,
  });
}

export function useCooperativeGroupScore(id: string) {
  return useQuery({
    queryKey: cooperativeKeys.score(id),
    queryFn: () => cooperativesApi.getGroupScore(id),
    enabled: !!id,
  });
}

export function useCooperativeLoans(id: string, query: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: cooperativeKeys.loans(id),
    queryFn: () => cooperativesApi.getLoans(id, query),
    enabled: !!id,
  });
}

export function useCreateCooperative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof cooperativesApi.create>[0]) =>
      cooperativesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cooperativeKeys.lists() });
    },
  });
}

export function useUpdateCooperative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof cooperativesApi.update>[1] }) =>
      cooperativesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: cooperativeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cooperativeKeys.detail(id) });
    },
  });
}

export function useAddCooperativeMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cooperativeId, borrowerId }: { cooperativeId: string; borrowerId: string }) =>
      cooperativesApi.addMember(cooperativeId, borrowerId),
    onSuccess: (_, { cooperativeId }) => {
      queryClient.invalidateQueries({ queryKey: cooperativeKeys.members(cooperativeId) });
      queryClient.invalidateQueries({ queryKey: cooperativeKeys.stats(cooperativeId) });
      queryClient.invalidateQueries({ queryKey: cooperativeKeys.lists() });
    },
  });
}

export function useRemoveCooperativeMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cooperativeId, borrowerId, reason }: { cooperativeId: string; borrowerId: string; reason?: string }) =>
      cooperativesApi.removeMember(cooperativeId, borrowerId, reason),
    onSuccess: (_, { cooperativeId }) => {
      queryClient.invalidateQueries({ queryKey: cooperativeKeys.members(cooperativeId) });
      queryClient.invalidateQueries({ queryKey: cooperativeKeys.stats(cooperativeId) });
      queryClient.invalidateQueries({ queryKey: cooperativeKeys.lists() });
    },
  });
}

export function useSuspendCooperative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cooperativesApi.suspend(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: cooperativeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cooperativeKeys.detail(id) });
    },
  });
}

export function useReactivateCooperative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cooperativesApi.reactivate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: cooperativeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cooperativeKeys.detail(id) });
    },
  });
}

export function useDissolveCooperative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cooperativesApi.dissolve(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cooperativeKeys.lists() });
    },
  });
}
