import { api, ApiResponse, PaginatedResponse } from "./client";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  channel: "IN_APP" | "SMS" | "EMAIL" | "PUSH" | "WHATSAPP";
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export type NotificationEventType =
  | "LOAN_UPDATE"
  | "PAYMENT_DUE"
  | "PAYMENT_RECEIVED"
  | "APPLICATION_STATUS"
  | "FARM_ALERT"
  | "DISBURSEMENT"
  | "SYSTEM";

export type NotificationChannelType = "IN_APP" | "SMS" | "EMAIL" | "WHATSAPP";

export type NotificationPreferences = Record<NotificationEventType, Record<NotificationChannelType, boolean>>;

export interface NotificationsQuery {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: string;
}

export const notificationsApi = {
  list: async (query: NotificationsQuery = {}) => {
    const res = await api.get<PaginatedResponse<Notification>>("/notifications", { params: query });
    return res.data;
  },

  getUnreadCount: async () => {
    const res = await api.get<ApiResponse<{ count: number }>>("/notifications/unread-count");
    return res.data.data.count;
  },

  markAsRead: async (id: string) => {
    const res = await api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return res.data.data;
  },

  markAllAsRead: async () => {
    await api.patch("/notifications/read-all");
  },

  delete: async (id: string) => {
    await api.delete(`/notifications/${id}`);
  },

  getPreferences: async () => {
    const res = await api.get<ApiResponse<NotificationPreferences>>("/notifications/preferences");
    return res.data.data;
  },

  updatePreferences: async (preferences: NotificationPreferences) => {
    const res = await api.patch<ApiResponse<NotificationPreferences>>(
      "/notifications/preferences",
      preferences
    );
    return res.data.data;
  },

  registerPushToken: async (token: string, platform: "web" | "ios" | "android") => {
    await api.post("/notifications/push-token", { token, platform });
  },

  unregisterPushToken: async (token: string) => {
    await api.delete("/notifications/push-token", { data: { token } });
  },
};
