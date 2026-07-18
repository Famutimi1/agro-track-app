"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, Check, CheckCheck } from "lucide-react";
import { useAuthStore } from "@/lib/stores";
import {
  useConversations,
  useMessages,
  useSendMessage,
  useMarkAsRead,
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/lib/hooks";
import Link from "next/link";
import { useSocketRoom, useSocketEvent } from "@/lib/socket/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { messageKeys } from "@/lib/hooks/use-messages";
import type { Message } from "@/lib/api/messages";

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const QUICK_REPLIES = ["Yes", "No", "I'll do that today", "Thank you"];

function DeliveryTick({ status, read }: { status?: string; read?: boolean }) {
  if (read || status === "READ") return <CheckCheck size={12} className="text-blue-300" />;
  if (status === "DELIVERED") return <CheckCheck size={12} className="text-white/60" />;
  if (status === "FAILED") return <span className="text-red-300">!</span>;
  return <Check size={12} className="text-white/60" />;
}

export default function BorrowerMessagesPage() {
  const userId = useAuthStore((s) => s.user?.id);
  const [newMsg, setNewMsg] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [view, setView] = useState<"chat" | "notifications">("chat");

  const { data: conversationsData, isLoading: conversationsLoading } = useConversations();
  const conversations = conversationsData?.data || [];

  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const { data: messagesData, isLoading: messagesLoading } = useMessages(activeConversationId);
  const messages = useMemo(() => [...(messagesData?.data || [])].reverse(), [messagesData]);

  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  const queryClient = useQueryClient();

  useSocketRoom(activeConversationId ? `conversation:${activeConversationId}` : null);

  const handleNewMessage = useCallback(
    (data: Message) => {
      if (data.conversationId === activeConversationId) {
        queryClient.invalidateQueries({ queryKey: messageKeys.messages(activeConversationId) });
      }
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations({}) });
    },
    [activeConversationId, queryClient]
  );
  useSocketEvent("message:new", handleNewMessage);

  useEffect(() => {
    if (activeConversationId && activeConversation && activeConversation.unreadCount > 0) {
      markAsRead.mutate(activeConversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId, activeConversation?.unreadCount]);

  const handleSend = () => {
    if (!newMsg.trim() || !activeConversationId) return;
    sendMessage.mutate(
      { conversationId: activeConversationId, content: newMsg.trim() },
      { onSuccess: () => setNewMsg("") }
    );
  };

  const sendQuickReply = (text: string) => {
    if (!activeConversationId) return;
    sendMessage.mutate({ conversationId: activeConversationId, content: text });
  };

  const otherParty = activeConversation?.otherParticipant;

  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications({ limit: 50 });
  const notifications = notificationsData?.data || [];
  const markNotificationRead = useMarkNotificationAsRead();
  const markAllNotificationsRead = useMarkAllNotificationsAsRead();
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">Messages</h1>
        <p className="text-[13px] text-[var(--muted)]">Chat with your lender and view alerts</p>
      </div>

      {/* View switcher */}
      <div className="flex gap-2 mb-5">
        {[
          { key: "chat" as const, label: "Chat" },
          { key: "notifications" as const, label: "Notifications", count: unreadNotifications },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full transition-colors ${
              view === t.key
                ? "bg-brand-green text-white"
                : "bg-[var(--input-bg)] text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {t.label}
            {t.count ? (
              <span
                className={`text-[10px] font-bold rounded-full px-1.5 ${
                  view === t.key ? "bg-white/25" : "bg-brand-green text-white"
                }`}
              >
                {t.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {view === "notifications" ? (
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text)]">Notifications</h3>
            {unreadNotifications > 0 && (
              <button
                onClick={() => markAllNotificationsRead.mutate()}
                disabled={markAllNotificationsRead.isPending}
                className="text-xs text-brand-green hover:underline disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
            {notificationsLoading ? (
              <p className="text-xs text-[var(--muted)] text-center py-8">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="text-xs text-[var(--muted)] text-center py-8">No notifications yet</p>
            ) : (
              notifications.map((n) => {
                const body = (
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        n.read ? "bg-transparent" : "bg-brand-green"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[var(--text)]">{n.title}</p>
                      <p className="text-[11px] text-[var(--muted)] leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-[var(--muted)] mt-1">{formatTime(n.createdAt)}</p>
                    </div>
                  </div>
                );
                const className = `block w-full text-left px-5 py-3 border-b border-[var(--border)] last:border-0 transition-colors ${
                  n.read ? "" : "bg-[var(--input-bg)]/50"
                } hover:bg-[var(--input-bg)]`;
                return n.actionUrl ? (
                  <Link
                    key={n.id}
                    href={n.actionUrl}
                    onClick={() => !n.read && markNotificationRead.mutate(n.id)}
                    className={className}
                  >
                    {body}
                  </Link>
                ) : (
                  <button
                    key={n.id}
                    onClick={() => !n.read && markNotificationRead.mutate(n.id)}
                    className={className}
                  >
                    {body}
                  </button>
                );
              })
            )}
          </div>
        </Card>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Conversation list */}
        <Card className="lg:col-span-1 p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <h3 className="text-sm font-bold text-[var(--text)]">Conversations</h3>
          </div>
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
            {conversationsLoading ? (
              <p className="text-xs text-[var(--muted)] text-center py-8">Loading…</p>
            ) : conversations.length === 0 ? (
              <p className="text-xs text-[var(--muted)] text-center py-8 px-4">No conversations yet</p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveConversationId(c.id)}
                  className={`w-full text-left px-4 py-3 border-b border-[var(--border)] last:border-0 transition-colors ${
                    c.id === activeConversationId ? "bg-[var(--input-bg)]" : "hover:bg-[var(--input-bg)]/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[var(--text)] truncate">
                      {c.otherParticipant ? `${c.otherParticipant.firstName} ${c.otherParticipant.lastName}` : "Conversation"}
                    </p>
                    {c.unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-brand-green text-white rounded-full px-1.5 py-0.5 flex-shrink-0">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  {c.lastMessage && (
                    <p className="text-[11px] text-[var(--muted)] truncate mt-0.5">{c.lastMessage.content}</p>
                  )}
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Active conversation */}
        <Card className="lg:col-span-2 flex flex-col h-[calc(100vh-220px)] p-0 overflow-hidden">
          {!activeConversationId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <MessageSquare size={32} className="text-[var(--muted)] mb-3" />
              <p className="text-sm font-semibold text-[var(--text)] mb-1">No conversation selected</p>
              <p className="text-xs text-[var(--muted)]">Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-green/15 text-brand-green flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {otherParty
                    ? `${otherParty.firstName?.[0] ?? ""}${otherParty.lastName?.[0] ?? ""}`.toUpperCase()
                    : "?"}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[var(--text)] truncate">
                    {otherParty ? `${otherParty.firstName} ${otherParty.lastName}` : "Conversation"}
                  </h3>
                  <p className="text-[11px] text-[var(--muted)]">
                    {otherParty?.role ? otherParty.role.replace(/_/g, " ").toLowerCase() : "Lender"}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {messagesLoading ? (
                  <p className="text-xs text-[var(--muted)] text-center py-8">Loading…</p>
                ) : messages.length === 0 ? (
                  <p className="text-xs text-[var(--muted)] text-center py-8">No messages yet — say hello!</p>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === userId;
                    if ((m.channel as string) === "SYSTEM" || (m as any).isSystem) {
                      return (
                        <div key={m.id} className="flex justify-center">
                          <span className="text-[11px] text-[var(--muted)] bg-[var(--input-bg)] rounded-full px-3 py-1">
                            {m.content}
                          </span>
                        </div>
                      );
                    }
                    return (
                      <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                            isMe ? "bg-brand-green text-white" : "bg-[var(--input-bg)] text-[var(--text)]"
                          }`}
                        >
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.content}</p>
                          <p className={`text-[10px] mt-1 flex items-center gap-1 ${isMe ? "text-white/60 justify-end" : "text-[var(--muted)]"}`}>
                            {formatTime(m.createdAt)}
                            {isMe && <DeliveryTick status={m.status} read={m.read} />}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {messages.length > 0 && (
                <div className="px-4 pt-3 flex gap-2 flex-wrap">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendQuickReply(q)}
                      disabled={sendMessage.isPending}
                      className="text-[11px] px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-brand-green/50 transition-colors disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-4 border-t border-[var(--border)] flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1"
                />
                <Button size="md" onClick={handleSend} disabled={sendMessage.isPending || !newMsg.trim()}>
                  <Send size={15} />
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
      )}
    </div>
  );
}
