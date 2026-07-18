import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fieldAgentsApi, FieldAgentsQuery } from "../api";

export const fieldAgentKeys = {
  all: ["fieldAgents"] as const,
  lists: () => [...fieldAgentKeys.all, "list"] as const,
  list: (query: FieldAgentsQuery) => [...fieldAgentKeys.lists(), query] as const,
  details: () => [...fieldAgentKeys.all, "detail"] as const,
  detail: (id: string) => [...fieldAgentKeys.details(), id] as const,
  stats: () => [...fieldAgentKeys.all, "stats"] as const,
  tasks: (id: string) => [...fieldAgentKeys.all, "tasks", id] as const,
  earnings: (id: string) => [...fieldAgentKeys.all, "earnings", id] as const,
};

export function useFieldAgents(query: FieldAgentsQuery = {}) {
  return useQuery({
    queryKey: fieldAgentKeys.list(query),
    queryFn: () => fieldAgentsApi.list(query),
  });
}

export function useFieldAgent(id: string) {
  return useQuery({
    queryKey: fieldAgentKeys.detail(id),
    queryFn: () => fieldAgentsApi.getById(id),
    enabled: !!id,
  });
}

export function useFieldAgentStats() {
  return useQuery({
    queryKey: fieldAgentKeys.stats(),
    queryFn: () => fieldAgentsApi.getStats(),
  });
}

export function useFieldAgentTasks(id: string, query: { status?: string } = {}) {
  return useQuery({
    queryKey: fieldAgentKeys.tasks(id),
    queryFn: () => fieldAgentsApi.getTasks(id, query),
    enabled: !!id,
  });
}

export function useFieldAgentEarnings(id: string) {
  return useQuery({
    queryKey: fieldAgentKeys.earnings(id),
    queryFn: () => fieldAgentsApi.getEarnings(id),
    enabled: !!id,
  });
}

export function useCreateFieldAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof fieldAgentsApi.create>[0]) =>
      fieldAgentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fieldAgentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: fieldAgentKeys.stats() });
    },
  });
}

export function useUpdateFieldAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof fieldAgentsApi.update>[1] }) =>
      fieldAgentsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: fieldAgentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: fieldAgentKeys.detail(id) });
    },
  });
}

export function useActivateFieldAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fieldAgentsApi.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: fieldAgentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: fieldAgentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: fieldAgentKeys.stats() });
    },
  });
}

export function useDeactivateFieldAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      fieldAgentsApi.deactivate(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: fieldAgentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: fieldAgentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: fieldAgentKeys.stats() });
    },
  });
}

export function useAssignTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof fieldAgentsApi.assignTask>[1] }) =>
      fieldAgentsApi.assignTask(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: fieldAgentKeys.tasks(id) });
    },
  });
}

export function useApproveAgentPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      fieldAgentsApi.approvePayout(id, amount),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: fieldAgentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: fieldAgentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: fieldAgentKeys.earnings(id) });
    },
  });
}

export function useRateVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ visitId, rating, notes }: { visitId: string; rating: number; notes?: string }) =>
      fieldAgentsApi.rateVerification(visitId, rating, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fieldAgentKeys.lists() });
    },
  });
}
