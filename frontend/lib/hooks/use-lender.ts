import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lendersApi } from "../api";

export const lenderKeys = {
  all: ["lender"] as const,
  organization: () => [...lenderKeys.all, "organization"] as const,
  dashboard: () => [...lenderKeys.all, "dashboard"] as const,
  team: () => [...lenderKeys.all, "team"] as const,
};

export function useMyOrganization() {
  return useQuery({
    queryKey: lenderKeys.organization(),
    queryFn: () => lendersApi.getMyOrganization(),
  });
}

export function useLenderDashboard() {
  return useQuery({
    queryKey: lenderKeys.dashboard(),
    queryFn: () => lendersApi.getDashboard(),
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useTeamMembers() {
  return useQuery({
    queryKey: lenderKeys.team(),
    queryFn: () => lendersApi.getTeamMembers(),
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof lendersApi.updateOrganization>[0]) =>
      lendersApi.updateOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lenderKeys.organization() });
    },
  });
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof lendersApi.inviteTeamMember>[0]) =>
      lendersApi.inviteTeamMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lenderKeys.team() });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => lendersApi.removeTeamMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lenderKeys.team() });
    },
  });
}
