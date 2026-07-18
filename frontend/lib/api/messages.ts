import { api, ApiResponse, PaginatedResponse } from "./client";

export type MessageChannel = "IN_APP" | "SMS" | "WHATSAPP" | "EMAIL";
export type MessageStatus = "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED";
export type BroadcastStatus = "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  channel: MessageChannel;
  status: MessageStatus;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    role?: string;
  };
}

export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  participants: Array<{
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    role: string;
    borrowerProfile?: {
      farmerId: string;
      farmScore: number;
    };
  }>;
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
    read: boolean;
    status: MessageStatus;
  };
  unreadCount: number;
  otherParticipant?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    role: string;
    borrowerProfile?: {
      farmerId: string;
      farmScore: number;
    };
  };
}

export interface MessageTemplate {
  id: string;
  lenderOrgId: string;
  name: string;
  category: string;
  content: string;
  channels: MessageChannel[];
  variables: string[];
  isSystem: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BroadcastAudience {
  type: "ALL" | "PROGRAM" | "STATE" | "COOPERATIVE" | "CUSTOM";
  programId?: string;
  state?: string;
  cooperativeId?: string;
  borrowerIds?: string[];
}

export interface Broadcast {
  id: string;
  lenderOrgId: string;
  subject?: string;
  content: string;
  audience: BroadcastAudience;
  channels: MessageChannel[];
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  status: BroadcastStatus;
  scheduledAt?: string;
  sentAt?: string;
  createdBy: string;
  createdAt: string;
}

export interface ConversationsQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateTemplateRequest {
  name: string;
  category: string;
  content: string;
  channels: MessageChannel[];
  variables?: string[];
}

export interface CreateBroadcastRequest {
  subject?: string;
  content: string;
  audience: BroadcastAudience;
  channels: MessageChannel[];
  scheduledAt?: string;
}

export const messagesApi = {
  getConversations: async (query: ConversationsQuery = {}) => {
    const res = await api.get<PaginatedResponse<Conversation>>("/messages/conversations", { params: query });
    return res.data;
  },

  getMessages: async (conversationId: string, query: { page?: number; limit?: number } = {}) => {
    const res = await api.get<PaginatedResponse<Message>>(`/messages/conversations/${conversationId}/messages`, {
      params: query,
    });
    return res.data;
  },

  sendMessage: async (conversationId: string, content: string, channel: MessageChannel = "IN_APP") => {
    const res = await api.post<ApiResponse<Message>>(`/messages/conversations/${conversationId}/messages`, {
      content,
      channel,
    });
    return res.data.data;
  },

  createConversation: async (participantIds: string[]) => {
    const res = await api.post<ApiResponse<Conversation>>("/messages/conversations", { participantIds });
    return res.data.data;
  },

  createConversationWithBorrower: async (borrowerId: string) => {
    const res = await api.post<ApiResponse<Conversation>>("/messages/conversations", { borrowerId });
    return res.data.data;
  },

  markAsRead: async (conversationId: string) => {
    await api.post(`/messages/conversations/${conversationId}/read`);
  },

  getUnreadCount: async () => {
    const res = await api.get<ApiResponse<{ count: number }>>("/messages/unread-count");
    return res.data.data.count;
  },

  // Templates
  getTemplates: async () => {
    const res = await api.get<ApiResponse<MessageTemplate[]>>("/messages/templates");
    return res.data.data;
  },

  createTemplate: async (data: CreateTemplateRequest) => {
    const res = await api.post<ApiResponse<MessageTemplate>>("/messages/templates", data);
    return res.data.data;
  },

  updateTemplate: async (id: string, data: Partial<CreateTemplateRequest>) => {
    const res = await api.patch<ApiResponse<MessageTemplate>>(`/messages/templates/${id}`, data);
    return res.data.data;
  },

  deleteTemplate: async (id: string) => {
    await api.delete(`/messages/templates/${id}`);
  },

  // Broadcasts
  getBroadcasts: async (query: { page?: number; limit?: number; status?: string } = {}) => {
    const res = await api.get<PaginatedResponse<Broadcast>>("/messages/broadcasts", { params: query });
    return res.data;
  },

  createBroadcast: async (data: CreateBroadcastRequest) => {
    const res = await api.post<ApiResponse<Broadcast>>("/messages/broadcasts", data);
    return res.data.data;
  },

  sendBroadcast: async (id: string) => {
    const res = await api.post<ApiResponse<{ sentCount: number; failedCount: number; totalRecipients: number }>>(
      `/messages/broadcasts/${id}/send`
    );
    return res.data.data;
  },

  getAudienceCount: async (audience: BroadcastAudience) => {
    const res = await api.post<ApiResponse<{ count: number }>>("/messages/broadcasts/audience-count", { audience });
    return res.data.data.count;
  },
};

export const TEMPLATE_CATEGORIES = [
  { value: "REMINDERS", label: "Payment Reminders" },
  { value: "NOTIFICATIONS", label: "Notifications" },
  { value: "UPDATES", label: "Status Updates" },
  { value: "VERIFICATION", label: "Verification" },
  { value: "CUSTOM", label: "Custom" },
];

export const DEFAULT_TEMPLATES: Array<{
  name: string;
  category: string;
  content: string;
  channels: MessageChannel[];
}> = [
  {
    name: "Repayment Reminder (3 Days)",
    category: "REMINDERS",
    content: "Hi {{name}}, this is a reminder that your loan repayment of N{{amount}} is due in 3 days. Please ensure timely payment to maintain your FarmScore.",
    channels: ["IN_APP", "SMS"],
  },
  {
    name: "Repayment Overdue (7 Days)",
    category: "REMINDERS",
    content: "Dear {{name}}, your repayment of N{{amount}} is now 7 days overdue. Please make payment immediately to avoid penalties and protect your FarmScore.",
    channels: ["IN_APP", "SMS", "WHATSAPP"],
  },
  {
    name: "Disbursement Notification",
    category: "NOTIFICATIONS",
    content: "Good news {{name}}! Your loan of N{{amount}} has been disbursed to your account. Please check your bank account.",
    channels: ["IN_APP", "SMS"],
  },
  {
    name: "Application Approved",
    category: "UPDATES",
    content: "Congratulations {{name}}! Your loan application for N{{amount}} has been approved. Disbursement will be processed within 24-48 hours.",
    channels: ["IN_APP", "SMS"],
  },
  {
    name: "Application Rejected",
    category: "UPDATES",
    content: "Dear {{name}}, we regret to inform you that your loan application was not approved at this time. Please contact support for more information.",
    channels: ["IN_APP"],
  },
  {
    name: "Farm Report Due",
    category: "VERIFICATION",
    content: "Hi {{name}}, your monthly farm report is due. Please submit it through the app or via USSD to maintain your FarmScore.",
    channels: ["IN_APP", "SMS"],
  },
  {
    name: "Loan Completed",
    category: "UPDATES",
    content: "Congratulations {{name}}! You have successfully completed your loan repayment. Thank you for being a valued borrower. Your FarmScore has been updated.",
    channels: ["IN_APP", "SMS"],
  },
  {
    name: "Verification Scheduled",
    category: "VERIFICATION",
    content: "Hi {{name}}, a field agent will visit your farm on {{date}} for verification. Please ensure you are available.",
    channels: ["IN_APP", "SMS"],
  },
];
