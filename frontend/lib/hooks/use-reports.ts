import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsApi, ReportsQuery, ReportRequest } from "../api";

export const reportKeys = {
  all: ["reports"] as const,
  lists: () => [...reportKeys.all, "list"] as const,
  list: (query: ReportsQuery) => [...reportKeys.lists(), query] as const,
  details: () => [...reportKeys.all, "detail"] as const,
  detail: (id: string) => [...reportKeys.details(), id] as const,
  types: () => [...reportKeys.all, "types"] as const,
};

export function useReports(query: ReportsQuery = {}) {
  return useQuery({
    queryKey: reportKeys.list(query),
    queryFn: () => reportsApi.list(query),
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => reportsApi.getById(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === "PENDING" || data.status === "PROCESSING")) {
        return 5000; // Poll every 5 seconds while processing
      }
      return false;
    },
  });
}

export function useReportTypes() {
  return useQuery({
    queryKey: reportKeys.types(),
    queryFn: () => reportsApi.getAvailableTypes(),
    staleTime: Infinity, // Report types rarely change
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReportRequest) => reportsApi.generate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: async (id: string) => {
      const blob = await reportsApi.download(id);
      return blob;
    },
  });
}

export function useCancelReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reportsApi.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(id) });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reportsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
}
