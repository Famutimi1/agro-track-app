import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { programsApi, LoanProgram, ProgramsQuery, CreateProgramRequest } from "../api";

export const programKeys = {
  all: ["programs"] as const,
  lists: () => [...programKeys.all, "list"] as const,
  list: (query: ProgramsQuery) => [...programKeys.lists(), query] as const,
  details: () => [...programKeys.all, "detail"] as const,
  detail: (id: string) => [...programKeys.details(), id] as const,
  discovery: () => [...programKeys.all, "discovery"] as const,
};

export function usePrograms(query: ProgramsQuery = {}) {
  return useQuery({
    queryKey: programKeys.list(query),
    queryFn: () => programsApi.list(query),
  });
}

export function useProgram(id: string) {
  return useQuery({
    queryKey: programKeys.detail(id),
    queryFn: () => programsApi.getById(id),
    enabled: !!id,
  });
}

export function useDiscoverPrograms(query: { state?: string; crop?: string; minScore?: number } = {}) {
  return useQuery({
    queryKey: [...programKeys.discovery(), query],
    queryFn: () => programsApi.discover(query),
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof programsApi.create>[0]) => programsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programKeys.lists() });
    },
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProgramRequest> }) =>
      programsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: programKeys.lists() });
      queryClient.invalidateQueries({ queryKey: programKeys.detail(id) });
    },
  });
}

export function useToggleProgramStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      programsApi.toggleStatus(id, active),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: programKeys.lists() });
      queryClient.invalidateQueries({ queryKey: programKeys.detail(id) });
    },
  });
}
