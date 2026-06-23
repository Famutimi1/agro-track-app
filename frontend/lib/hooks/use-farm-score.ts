import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { farmScoreApi } from "../api";

export const farmScoreKeys = {
  all: ["farmScore"] as const,
  current: () => [...farmScoreKeys.all, "current"] as const,
  history: () => [...farmScoreKeys.all, "history"] as const,
  breakdown: (score: number) => [...farmScoreKeys.all, "breakdown", score] as const,
};

export function useMyFarmScore() {
  return useQuery({
    queryKey: farmScoreKeys.current(),
    queryFn: () => farmScoreApi.getCurrent(),
  });
}

export function useFarmScoreHistory(limit = 12) {
  return useQuery({
    queryKey: farmScoreKeys.history(),
    queryFn: () => farmScoreApi.getHistory(limit),
  });
}

export function useFarmScoreBreakdown(score: number) {
  return useQuery({
    queryKey: farmScoreKeys.breakdown(score),
    queryFn: () => farmScoreApi.getBreakdown(score),
    enabled: score > 0,
  });
}

export function useRecalculateFarmScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (borrowerId: string) => farmScoreApi.recalculate(borrowerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmScoreKeys.all });
    },
  });
}
