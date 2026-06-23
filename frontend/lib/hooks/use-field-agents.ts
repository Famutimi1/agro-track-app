import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fieldAgentsApi, fieldVisitsApi, FieldAgentsQuery, FieldVisitsQuery } from "../api";

export const fieldAgentKeys = {
  all: ["fieldAgents"] as const,
  lists: () => [...fieldAgentKeys.all, "list"] as const,
  list: (query: FieldAgentsQuery) => [...fieldAgentKeys.lists(), query] as const,
  details: () => [...fieldAgentKeys.all, "detail"] as const,
  detail: (id: string) => [...fieldAgentKeys.details(), id] as const,
  me: () => [...fieldAgentKeys.all, "me"] as const,
  myVisits: () => [...fieldAgentKeys.all, "myVisits"] as const,
};

export const fieldVisitKeys = {
  all: ["fieldVisits"] as const,
  lists: () => [...fieldVisitKeys.all, "list"] as const,
  list: (query: FieldVisitsQuery) => [...fieldVisitKeys.lists(), query] as const,
  details: () => [...fieldVisitKeys.all, "detail"] as const,
  detail: (id: string) => [...fieldVisitKeys.details(), id] as const,
};

// Field Agent hooks
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

export function useMyFieldAgentProfile() {
  return useQuery({
    queryKey: fieldAgentKeys.me(),
    queryFn: () => fieldAgentsApi.getMyProfile(),
  });
}

export function useMyFieldVisits(status?: string) {
  return useQuery({
    queryKey: fieldAgentKeys.myVisits(),
    queryFn: () => fieldAgentsApi.getMyVisits({ status }),
  });
}

export function useCreateFieldAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof fieldAgentsApi.create>[0]) =>
      fieldAgentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fieldAgentKeys.lists() });
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

export function useUpdateFieldAgentLocation() {
  return useMutation({
    mutationFn: ({ latitude, longitude }: { latitude: number; longitude: number }) =>
      fieldAgentsApi.updateLocation(latitude, longitude),
  });
}

// Field Visit hooks
export function useFieldVisits(query: FieldVisitsQuery = {}) {
  return useQuery({
    queryKey: fieldVisitKeys.list(query),
    queryFn: () => fieldVisitsApi.list(query),
  });
}

export function useFieldVisit(id: string) {
  return useQuery({
    queryKey: fieldVisitKeys.detail(id),
    queryFn: () => fieldVisitsApi.getById(id),
    enabled: !!id,
  });
}

export function useScheduleFieldVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof fieldVisitsApi.schedule>[0]) =>
      fieldVisitsApi.schedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fieldVisitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: fieldAgentKeys.myVisits() });
    },
  });
}

export function useStartFieldVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, latitude, longitude }: { id: string; latitude: number; longitude: number }) =>
      fieldVisitsApi.startVisit(id, latitude, longitude),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: fieldVisitKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: fieldAgentKeys.myVisits() });
    },
  });
}

export function useCompleteFieldVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof fieldVisitsApi.completeVisit>[1] }) =>
      fieldVisitsApi.completeVisit(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: fieldVisitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: fieldVisitKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: fieldAgentKeys.myVisits() });
    },
  });
}
