import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { farmReportsApi, FarmReportsQuery, CreateFarmReportRequest } from "../api";

export const farmReportKeys = {
  all: ["farmReports"] as const,
  lists: () => [...farmReportKeys.all, "list"] as const,
  list: (query: FarmReportsQuery) => [...farmReportKeys.lists(), query] as const,
  mine: () => [...farmReportKeys.all, "mine"] as const,
  details: () => [...farmReportKeys.all, "detail"] as const,
  detail: (id: string) => [...farmReportKeys.details(), id] as const,
};

export function useFarmReports(query: FarmReportsQuery = {}) {
  return useQuery({
    queryKey: farmReportKeys.list(query),
    queryFn: () => farmReportsApi.list(query),
  });
}

export function useMyFarmReports(query: FarmReportsQuery = {}) {
  return useQuery({
    queryKey: farmReportKeys.mine(),
    queryFn: () => farmReportsApi.listMine(query),
  });
}

export function useFarmReport(id: string) {
  return useQuery({
    queryKey: farmReportKeys.detail(id),
    queryFn: () => farmReportsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateFarmReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFarmReportRequest) => farmReportsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmReportKeys.lists() });
      queryClient.invalidateQueries({ queryKey: farmReportKeys.mine() });
    },
  });
}

export function useUploadFarmReportPhotos() {
  return useMutation({
    mutationFn: (files: File[]) => farmReportsApi.uploadPhotos(files),
  });
}

export function useVerifyFarmReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => farmReportsApi.verify(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: farmReportKeys.lists() });
      queryClient.invalidateQueries({ queryKey: farmReportKeys.detail(id) });
    },
  });
}

export function useRejectFarmReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rejectionNote }: { id: string; rejectionNote: string }) =>
      farmReportsApi.reject(id, rejectionNote),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: farmReportKeys.lists() });
      queryClient.invalidateQueries({ queryKey: farmReportKeys.detail(id) });
    },
  });
}
