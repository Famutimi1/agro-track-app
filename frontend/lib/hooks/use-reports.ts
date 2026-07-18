import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsApi, ReportsQuery, GenerateReportOptions, DateRangeQuery } from "../api";

export const reportKeys = {
  all: ["reports"] as const,
  lists: () => [...reportKeys.all, "list"] as const,
  list: (query: ReportsQuery) => [...reportKeys.lists(), query] as const,
  details: () => [...reportKeys.all, "detail"] as const,
  detail: (id: string) => [...reportKeys.details(), id] as const,
  types: () => [...reportKeys.all, "types"] as const,
  impact: () => [...reportKeys.all, "impact"] as const,
  job: (jobId: string) => [...reportKeys.all, "job", jobId] as const,
  portfolio: (query: DateRangeQuery) => [...reportKeys.all, "portfolio", query] as const,
  stateBreakdown: (query: DateRangeQuery) => [...reportKeys.all, "state-breakdown", query] as const,
  cropAnalysis: (query: DateRangeQuery) => [...reportKeys.all, "crop-analysis", query] as const,
  genderDemographics: () => [...reportKeys.all, "gender-demographics"] as const,
  overdue: () => [...reportKeys.all, "overdue"] as const,
  impactReport: (query: DateRangeQuery) => [...reportKeys.all, "impact-report", query] as const,
  fieldAgents: (query: DateRangeQuery) => [...reportKeys.all, "field-agents", query] as const,
  audit: (query: DateRangeQuery) => [...reportKeys.all, "audit", query] as const,
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
        return 5000;
      }
      return false;
    },
  });
}

export function useImpactMetrics() {
  return useQuery({
    queryKey: reportKeys.impact(),
    queryFn: () => reportsApi.getImpactMetrics(),
  });
}

export function useReportJob(jobId: string | null) {
  return useQuery({
    queryKey: reportKeys.job(jobId || ""),
    queryFn: () => reportsApi.getJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === "PENDING" || data.status === "PROCESSING")) {
        return 2000;
      }
      return false;
    },
  });
}

export function usePortfolioReport(query: DateRangeQuery = {}) {
  return useQuery({
    queryKey: reportKeys.portfolio(query),
    queryFn: () => reportsApi.getPortfolioReport(query),
  });
}

export function useStateBreakdownReport(query: DateRangeQuery = {}) {
  return useQuery({
    queryKey: reportKeys.stateBreakdown(query),
    queryFn: () => reportsApi.getStateBreakdownReport(query),
  });
}

export function useCropAnalysisReport(query: DateRangeQuery = {}) {
  return useQuery({
    queryKey: reportKeys.cropAnalysis(query),
    queryFn: () => reportsApi.getCropAnalysisReport(query),
  });
}

export function useGenderDemographicsReport() {
  return useQuery({
    queryKey: reportKeys.genderDemographics(),
    queryFn: () => reportsApi.getGenderDemographicsReport(),
  });
}

export function useOverdueReport() {
  return useQuery({
    queryKey: reportKeys.overdue(),
    queryFn: () => reportsApi.getOverdueReport(),
  });
}

export function useImpactReport(query: DateRangeQuery = {}) {
  return useQuery({
    queryKey: reportKeys.impactReport(query),
    queryFn: () => reportsApi.getImpactReport(query),
  });
}

export function useFieldAgentActivityReport(query: DateRangeQuery = {}) {
  return useQuery({
    queryKey: reportKeys.fieldAgents(query),
    queryFn: () => reportsApi.getFieldAgentActivityReport(query),
  });
}

export function useAuditExport(query: DateRangeQuery = {}) {
  return useQuery({
    queryKey: reportKeys.audit(query),
    queryFn: () => reportsApi.getAuditExport(query),
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateReportOptions) => reportsApi.generateReport(data),
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
