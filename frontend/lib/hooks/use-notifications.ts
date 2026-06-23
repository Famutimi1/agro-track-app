import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi, NotificationsQuery } from "../api";
import { useNotificationsStore } from "../stores";

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (query: NotificationsQuery) => [...notificationKeys.lists(), query] as const,
  unreadCount: () => [...notificationKeys.all, "unreadCount"] as const,
  preferences: () => [...notificationKeys.all, "preferences"] as const,
};

export function useNotifications(query: NotificationsQuery = {}) {
  return useQuery({
    queryKey: notificationKeys.list(query),
    queryFn: () => notificationsApi.list(query),
  });
}

export function useUnreadNotificationCount() {
  const { fetchUnreadCount, unreadCount } = useNotificationsStore();

  const query = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      await fetchUnreadCount();
      return useNotificationsStore.getState().unreadCount;
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });

  return { ...query, data: unreadCount };
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: () => notificationsApi.getPreferences(),
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  const { markAsRead } = useNotificationsStore();

  return useMutation({
    mutationFn: async (id: string) => {
      await markAsRead(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const { markAllAsRead } = useNotificationsStore();

  return useMutation({
    mutationFn: async () => {
      await markAllAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: Parameters<typeof notificationsApi.updatePreferences>[0]) =>
      notificationsApi.updatePreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() });
    },
  });
}

export function useRegisterPushToken() {
  return useMutation({
    mutationFn: ({ token, platform }: { token: string; platform: "web" | "ios" | "android" }) =>
      notificationsApi.registerPushToken(token, platform),
  });
}
