import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi, NotificationSettings, DisbursementRules } from "../api/settings";

export const settingsKeys = {
  all: ["settings"] as const,
  organization: () => [...settingsKeys.all, "organization"] as const,
  team: () => [...settingsKeys.all, "team"] as const,
  notifications: () => [...settingsKeys.all, "notifications"] as const,
  disbursementRules: () => [...settingsKeys.all, "disbursement-rules"] as const,
  apiKeys: () => [...settingsKeys.all, "api-keys"] as const,
  sessions: () => [...settingsKeys.all, "sessions"] as const,
  billing: () => [...settingsKeys.all, "billing"] as const,
  integrations: () => [...settingsKeys.all, "integrations"] as const,
};

export function useOrganization() {
  return useQuery({
    queryKey: settingsKeys.organization(),
    queryFn: () => settingsApi.getOrganization(),
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.updateOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.organization() });
    },
  });
}

export function useTeamMembers() {
  return useQuery({
    queryKey: settingsKeys.team(),
    queryFn: () => settingsApi.getTeamMembers(),
  });
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.inviteTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.team() });
    },
  });
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: { role?: string; firstName?: string; lastName?: string } }) =>
      settingsApi.updateTeamMember(memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.team() });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.removeTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.team() });
    },
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: settingsKeys.notifications(),
    queryFn: () => settingsApi.getNotificationSettings(),
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<NotificationSettings>) => settingsApi.updateNotificationSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.notifications() });
    },
  });
}

export function useDisbursementRules() {
  return useQuery({
    queryKey: settingsKeys.disbursementRules(),
    queryFn: () => settingsApi.getDisbursementRules(),
  });
}

export function useUpdateDisbursementRules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rules: Partial<DisbursementRules>) => settingsApi.updateDisbursementRules(rules),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.disbursementRules() });
    },
  });
}

export function useApiKeys() {
  return useQuery({
    queryKey: settingsKeys.apiKeys(),
    queryFn: () => settingsApi.getApiKeys(),
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.createApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.apiKeys() });
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.revokeApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.apiKeys() });
    },
  });
}

export function useSessions() {
  return useQuery({
    queryKey: settingsKeys.sessions(),
    queryFn: () => settingsApi.getSessions(),
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.sessions() });
    },
  });
}

export function useBillingInfo() {
  return useQuery({
    queryKey: settingsKeys.billing(),
    queryFn: () => settingsApi.getBillingInfo(),
  });
}

export function useIntegrations() {
  return useQuery({
    queryKey: settingsKeys.integrations(),
    queryFn: () => settingsApi.getIntegrations(),
  });
}

export function useUpdateIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ integration, config }: { integration: string; config: Record<string, any> }) =>
      settingsApi.updateIntegration(integration, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.integrations() });
    },
  });
}
