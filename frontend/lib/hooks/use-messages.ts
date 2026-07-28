import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  messagesApi,
  ConversationsQuery,
  CreateTemplateRequest,
  CreateBroadcastRequest,
  BroadcastAudience,
  MessageChannel,
} from "../api/messages";

export const messageKeys = {
  all: ["messages"] as const,
  conversations: (query: ConversationsQuery) => [...messageKeys.all, "conversations", query] as const,
  conversation: (id: string) => [...messageKeys.all, "conversation", id] as const,
  messages: (conversationId: string) => [...messageKeys.all, "msgs", conversationId] as const,
  unreadCount: () => [...messageKeys.all, "unread"] as const,
  templates: () => [...messageKeys.all, "templates"] as const,
  broadcasts: (query?: any) => [...messageKeys.all, "broadcasts", query] as const,
};

export function useConversations(query: ConversationsQuery = {}) {
  return useQuery({
    queryKey: messageKeys.conversations(query),
    queryFn: () => messagesApi.getConversations(query),
    refetchInterval: 30000,
  });
}

export function useMessages(conversationId: string | null, query: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: messageKeys.messages(conversationId || ""),
    queryFn: () => messagesApi.getMessages(conversationId!, query),
    enabled: !!conversationId,
    // Realtime delivery now runs over sockets (message:new) with reconnect
    // catch-up (conversation:sync), so this poll is only a safety net for the
    // rare case where a socket event is missed. Lengthened from 5s to cut load.
    refetchInterval: 20000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: messageKeys.unreadCount(),
    queryFn: () => messagesApi.getUnreadCount(),
    refetchInterval: 30000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      content,
      channel,
      clientId,
    }: {
      conversationId: string;
      content: string;
      channel?: MessageChannel;
      clientId?: string;
    }) => messagesApi.sendMessage(conversationId, content, channel, clientId),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations({}) });
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (participantIds: string[]) => messagesApi.createConversation(participantIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations({}) });
    },
  });
}

export function useCreateConversationWithBorrower() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (borrowerId: string) => messagesApi.createConversationWithBorrower(borrowerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations({}) });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => messagesApi.markAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations({}) });
    },
  });
}

// Templates
export function useMessageTemplates() {
  return useQuery({
    queryKey: messageKeys.templates(),
    queryFn: () => messagesApi.getTemplates(),
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTemplateRequest) => messagesApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.templates() });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTemplateRequest> }) =>
      messagesApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.templates() });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => messagesApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.templates() });
    },
  });
}

// Broadcasts
export function useBroadcasts(query: { page?: number; limit?: number; status?: string } = {}) {
  return useQuery({
    queryKey: messageKeys.broadcasts(query),
    queryFn: () => messagesApi.getBroadcasts(query),
  });
}

export function useCreateBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBroadcastRequest) => messagesApi.createBroadcast(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.broadcasts() });
    },
  });
}

export function useSendBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => messagesApi.sendBroadcast(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.broadcasts() });
    },
  });
}

export function useAudienceCount() {
  return useMutation({
    mutationFn: (audience: BroadcastAudience) => messagesApi.getAudienceCount(audience),
  });
}
