"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  Send,
  Search,
  Users,
  Radio,
  FileText,
  Plus,
  ChevronRight,
  Loader2,
  Check,
  CheckCheck,
  Clock,
  MessageSquare,
  User,
  X,
  Copy,
  Trash2,
  Edit2,
} from "lucide-react";
import {
  useConversations,
  useMessages,
  useSendMessage,
  useMarkAsRead,
  useMessageTemplates,
  useCreateTemplate,
  useDeleteTemplate,
  useBroadcasts,
  useCreateBroadcast,
  useSendBroadcast,
  useAudienceCount,
} from "@/lib/hooks/use-messages";
import { usePrograms } from "@/lib/hooks/use-programs";
import { useBorrowers } from "@/lib/hooks/use-borrowers";
import { messageKeys, useCreateConversationWithBorrower } from "@/lib/hooks/use-messages";
import { useSocketRoom, useSocketEvent } from "@/lib/socket/hooks";
import { useRealtimeStore, useAuthStore } from "@/lib/stores";
import { ackMessageDelivered, emitConversationRead, syncConversation } from "@/lib/socket";
import {
  Conversation,
  Message,
  MessageChannel,
  MessageTemplate,
  BroadcastAudience,
  TEMPLATE_CATEGORIES,
  DEFAULT_TEMPLATES,
} from "@/lib/api/messages";

type Tab = "conversations" | "broadcast" | "templates";

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("conversations");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showNewConvoModal, setShowNewConvoModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const targetConversationId = searchParams.get("conversationId");

  const { data: conversationsData, isLoading: convoLoading } = useConversations({ search: searchQuery });
  const { data: messagesData, isLoading: msgsLoading } = useMessages(activeConversation?.id || null);
  const { data: templates } = useMessageTemplates();
  const { data: broadcastsData } = useBroadcasts();
  const { data: programsData } = usePrograms({ limit: 100 });

  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();

  const conversations = conversationsData?.data || [];
  // Order by seq (monotonic per-conversation) so messages never render out of
  // order regardless of fetch/socket timing. Falls back to createdAt for any
  // legacy rows without a seq.
  const messages = [...(messagesData?.data || [])].sort((a: Message, b: Message) => {
    const sa = a.seq != null ? Number(a.seq) : 0;
    const sb = b.seq != null ? Number(b.seq) : 0;
    if (sa !== sb) return sa - sb;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
  const broadcasts = broadcastsData?.data || [];
  const programs = programsData?.data || [];

  // Auto-open a conversation when arriving via ?conversationId= (e.g. from the
  // "Message" button on a borrower's profile).
  useEffect(() => {
    if (targetConversationId && !activeConversation && conversations.length > 0) {
      const match = conversations.find((c) => c.id === targetConversationId);
      if (match) {
        setActiveTab("conversations");
        setActiveConversation(match);
      }
    }
  }, [targetConversationId, activeConversation, conversations]);

  // Realtime: join the active conversation room and refresh on incoming messages.
  useSocketRoom(activeConversation ? `conversation:${activeConversation.id}` : null);

  const isConnected = useRealtimeStore((s) => s.isConnected);
  const userId = useAuthStore((s) => s.user?.id);

  const refreshActive = useCallback(() => {
    if (activeConversation) {
      queryClient.invalidateQueries({ queryKey: messageKeys.messages(activeConversation.id) });
    }
    queryClient.invalidateQueries({ queryKey: messageKeys.conversations({}) });
  }, [activeConversation, queryClient]);

  const handleNewMessage = useCallback(
    (data: Message) => {
      if (activeConversation && data.conversationId === activeConversation.id) {
        // Delivered receipt: confirm receipt of the other party's message.
        if (userId && data.senderId !== userId) {
          ackMessageDelivered(data.id);
        }
        queryClient.invalidateQueries({ queryKey: messageKeys.messages(activeConversation.id) });
      }
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations({}) });
    },
    [activeConversation, queryClient, userId]
  );
  useSocketEvent("message:new", handleNewMessage);

  // Delivered/read receipts pushed from the server → refresh so ticks update live.
  useSocketEvent("message:delivered", refreshActive);
  useSocketEvent("message:read", refreshActive);

  // Reconnect catch-up: pull anything newer than the last seq we hold for the
  // open conversation when the socket (re)connects.
  useEffect(() => {
    if (!isConnected || !activeConversation) return;
    const lastSeq = messages.length ? Number(messages[messages.length - 1].seq ?? 0) : 0;
    syncConversation(activeConversation.id, lastSeq).then((missed) => {
      if (missed.length > 0) refreshActive();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, activeConversation?.id]);

  useEffect(() => {
    if (activeConversation && activeConversation.unreadCount > 0) {
      markAsRead.mutate(activeConversation.id);
      // Live read receipt over the socket so the sender's ticks turn blue now.
      emitConversationRead(activeConversation.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createConversation = useCreateConversationWithBorrower();

  const handleStartConversation = async (borrowerId: string) => {
    try {
      const conversation = await createConversation.mutateAsync(borrowerId);
      setShowNewConvoModal(false);
      setActiveTab("conversations");
      setActiveConversation(conversation);
    } catch {
      // surfaced by the mutation state in the modal
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      await sendMessage.mutateAsync({
        conversationId: activeConversation.id,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return d.toLocaleDateString([], { weekday: "short" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SENT":
        return <Check size={12} className="text-[var(--muted)]" />;
      case "DELIVERED":
        return <CheckCheck size={12} className="text-[var(--muted)]" />;
      case "READ":
        return <CheckCheck size={12} className="text-blue-500" />;
      default:
        return <Clock size={12} className="text-[var(--muted)]" />;
    }
  };

  return (
    <div className="h-[calc(100vh-140px)]">
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setActiveTab("conversations")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === "conversations"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--muted-bg)] text-[var(--text)] hover:bg-[var(--border)]"
          }`}
        >
          <MessageSquare size={14} className="inline mr-1.5" />
          Conversations
        </button>
        <button
          onClick={() => setActiveTab("broadcast")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === "broadcast"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--muted-bg)] text-[var(--text)] hover:bg-[var(--border)]"
          }`}
        >
          <Radio size={14} className="inline mr-1.5" />
          Broadcast
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === "templates"
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--muted-bg)] text-[var(--text)] hover:bg-[var(--border)]"
          }`}
        >
          <FileText size={14} className="inline mr-1.5" />
          Templates
        </button>
      </div>

      {activeTab === "conversations" && (
        <div className="flex gap-4 h-full">
          {/* Conversation List */}
          <Card className="w-80 flex-shrink-0 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-[var(--border)] space-y-2">
              <Button size="sm" className="w-full" onClick={() => setShowNewConvoModal(true)}>
                <Plus size={14} className="mr-1" /> New message
              </Button>
              <div className="flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-2.5 py-1.5">
                <Search size={13} className="text-[var(--muted)]" />
                <input
                  className="bg-transparent border-none outline-none text-xs flex-1 text-[var(--text)]"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {convoLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-[var(--muted)]" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare size={32} className="mx-auto text-[var(--muted)] mb-2" />
                  <p className="text-xs text-[var(--muted)]">No conversations yet</p>
                </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveConversation(c)}
                    className={`w-full text-left px-4 py-3 border-b border-[var(--border)] transition-colors cursor-pointer ${
                      activeConversation?.id === c.id
                        ? "bg-[var(--primary)]/5 border-l-2 border-l-[var(--primary)]"
                        : "hover:bg-[var(--input-bg)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--muted-bg)] flex items-center justify-center shrink-0">
                        {c.otherParticipant?.avatarUrl ? (
                          <img
                            src={c.otherParticipant.avatarUrl}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User size={16} className="text-[var(--muted)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold text-[var(--text)] truncate">
                            {c.otherParticipant
                              ? `${c.otherParticipant.firstName} ${c.otherParticipant.lastName}`
                              : "Unknown"}
                          </span>
                          <span className="text-[10px] text-[var(--muted)] shrink-0">
                            {c.lastMessage ? formatTime(c.lastMessage.createdAt) : ""}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-[var(--muted)] truncate">
                            {c.lastMessage?.content || "No messages yet"}
                          </p>
                          {c.unreadCount > 0 && (
                            <span className="w-4 h-4 bg-[var(--primary)] rounded-full text-[9px] text-white flex items-center justify-center font-bold shrink-0 ml-1">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>

          {/* Chat Area */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            {activeConversation ? (
              <>
                <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--muted-bg)] flex items-center justify-center">
                      <User size={18} className="text-[var(--muted)]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text)]">
                        {activeConversation.otherParticipant
                          ? `${activeConversation.otherParticipant.firstName} ${activeConversation.otherParticipant.lastName}`
                          : "Unknown"}
                      </h3>
                      {activeConversation.otherParticipant?.borrowerProfile && (
                        <p className="text-[11px] text-[var(--muted)]">
                          {activeConversation.otherParticipant.borrowerProfile.farmerId} · Score:{" "}
                          {activeConversation.otherParticipant.borrowerProfile.farmScore}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `/lender/borrowers/${activeConversation.otherParticipant?.id}`,
                        "_blank"
                      )
                    }
                  >
                    View Profile <ChevronRight size={12} />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {msgsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-[var(--muted)]" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-[var(--muted)]">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.sender.role !== "BORROWER";
                      return (
                        <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                              isMe
                                ? "bg-[var(--primary)] text-white"
                                : "bg-[var(--input-bg)] text-[var(--text)]"
                            }`}
                          >
                            <p className="text-xs leading-relaxed">{m.content}</p>
                            <div
                              className={`flex items-center gap-1 mt-1 ${
                                isMe ? "justify-end" : ""
                              }`}
                            >
                              <span
                                className={`text-[10px] ${
                                  isMe ? "text-white/60" : "text-[var(--muted)]"
                                }`}
                              >
                                {formatTime(m.createdAt)}
                              </span>
                              {isMe && getStatusIcon(m.status)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-[var(--border)] flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button onClick={handleSend} disabled={!newMessage.trim() || sendMessage.isPending}>
                    {sendMessage.isPending ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Send size={15} />
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare size={48} className="mx-auto text-[var(--muted)] mb-3" />
                  <p className="text-sm text-[var(--muted)]">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "broadcast" && (
        <BroadcastTab
          broadcasts={broadcasts}
          programs={programs}
          templates={templates || []}
          onNewBroadcast={() => setShowBroadcastModal(true)}
        />
      )}

      {activeTab === "templates" && (
        <TemplatesTab
          templates={templates || []}
          onNewTemplate={() => setShowTemplateModal(true)}
        />
      )}

      {/* Broadcast Modal */}
      <BroadcastModal
        open={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        programs={programs}
        templates={templates || []}
      />

      {/* Template Modal */}
      <TemplateModal
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
      />

      {/* New Conversation Modal */}
      <NewConversationModal
        open={showNewConvoModal}
        onClose={() => setShowNewConvoModal(false)}
        onSelect={handleStartConversation}
        isCreating={createConversation.isPending}
      />
    </div>
  );
}

function NewConversationModal({
  open,
  onClose,
  onSelect,
  isCreating,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (borrowerId: string) => void;
  isCreating: boolean;
}) {
  const [search, setSearch] = useState("");
  const { data: borrowersData, isLoading } = useBorrowers({ search: search || undefined, limit: 20 });
  const borrowers = borrowersData?.data || [];

  return (
    <Modal open={open} onClose={onClose} title="New message">
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-2.5 py-2">
          <Search size={14} className="text-[var(--muted)]" />
          <input
            autoFocus
            className="bg-transparent border-none outline-none text-sm flex-1 text-[var(--text)]"
            placeholder="Search borrowers by name or farmer ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="max-h-80 overflow-y-auto -mx-1">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-[var(--muted)]" />
            </div>
          ) : borrowers.length === 0 ? (
            <p className="text-xs text-[var(--muted)] text-center py-8">No borrowers found</p>
          ) : (
            borrowers.map((b) => (
              <button
                key={b.id}
                onClick={() => onSelect(b.id)}
                disabled={isCreating}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[var(--input-bg)] transition-colors flex items-center gap-3 disabled:opacity-50"
              >
                <div className="w-9 h-9 rounded-full bg-[var(--muted-bg)] flex items-center justify-center shrink-0">
                  {b.user.avatarUrl ? (
                    <img src={b.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User size={16} className="text-[var(--muted)]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text)] truncate">
                    {b.user.firstName} {b.user.lastName}
                  </p>
                  <p className="text-[11px] text-[var(--muted)] font-mono">{b.farmerId}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}

function BroadcastTab({
  broadcasts,
  programs,
  templates,
  onNewBroadcast,
}: {
  broadcasts: any[];
  programs: any[];
  templates: MessageTemplate[];
  onNewBroadcast: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text)]">Broadcast Messages</h2>
          <p className="text-xs text-[var(--muted)]">Send messages to multiple borrowers at once</p>
        </div>
        <Button onClick={onNewBroadcast}>
          <Plus size={14} /> New Broadcast
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {broadcasts.length === 0 ? (
          <Card className="col-span-full text-center py-12">
            <Radio size={48} className="mx-auto text-[var(--muted)] mb-3" />
            <p className="text-sm text-[var(--muted)]">No broadcasts yet</p>
            <Button className="mt-4" onClick={onNewBroadcast}>
              <Plus size={14} /> Create First Broadcast
            </Button>
          </Card>
        ) : (
          broadcasts.map((b) => (
            <Card key={b.id}>
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    b.status === "SENT"
                      ? "bg-green-100 text-green-700"
                      : b.status === "SCHEDULED"
                      ? "bg-blue-100 text-blue-700"
                      : b.status === "DRAFT"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {b.status}
                </span>
                <span className="text-[10px] text-[var(--muted)]">
                  {new Date(b.createdAt).toLocaleDateString()}
                </span>
              </div>
              {b.subject && <h4 className="text-sm font-bold text-[var(--text)] mb-1">{b.subject}</h4>}
              <p className="text-xs text-[var(--muted)] line-clamp-2 mb-3">{b.content}</p>
              <div className="flex items-center gap-3 text-[10px] text-[var(--muted)]">
                <span>Sent: {b.sentCount}</span>
                <span>Delivered: {b.deliveredCount}</span>
                <span>Read: {b.readCount}</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function TemplatesTab({
  templates,
  onNewTemplate,
}: {
  templates: MessageTemplate[];
  onNewTemplate: () => void;
}) {
  const deleteTemplate = useDeleteTemplate();

  const groupedTemplates = templates.reduce((acc, t) => {
    const cat = t.category || "CUSTOM";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {} as Record<string, MessageTemplate[]>);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text)]">Message Templates</h2>
          <p className="text-xs text-[var(--muted)]">Reusable message templates for common scenarios</p>
        </div>
        <Button onClick={onNewTemplate}>
          <Plus size={14} /> New Template
        </Button>
      </div>

      {Object.entries(groupedTemplates).map(([category, catTemplates]) => (
        <div key={category} className="mb-6">
          <h3 className="text-sm font-bold text-[var(--text)] mb-3">
            {TEMPLATE_CATEGORIES.find((c) => c.value === category)?.label || category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {catTemplates.map((t) => (
              <Card key={t.id} className="relative">
                {t.isSystem && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] rounded">
                    System
                  </span>
                )}
                <h4 className="text-sm font-bold text-[var(--text)] mb-1 pr-16">{t.name}</h4>
                <p className="text-xs text-[var(--muted)] mb-2 line-clamp-2">{t.content}</p>
                <div className="flex items-center gap-1 mb-3">
                  {t.channels.map((ch) => (
                    <span
                      key={ch}
                      className="px-1.5 py-0.5 bg-[var(--muted-bg)] text-[9px] text-[var(--muted)] rounded"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1">
                    <Copy size={12} /> Use
                  </Button>
                  {!t.isSystem && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => deleteTemplate.mutate(t.id)}
                      disabled={deleteTemplate.isPending}
                    >
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {templates.length === 0 && (
        <Card className="text-center py-12">
          <FileText size={48} className="mx-auto text-[var(--muted)] mb-3" />
          <p className="text-sm text-[var(--muted)]">No templates yet</p>
          <Button className="mt-4" onClick={onNewTemplate}>
            <Plus size={14} /> Create First Template
          </Button>
        </Card>
      )}
    </div>
  );
}

function BroadcastModal({
  open,
  onClose,
  programs,
  templates,
}: {
  open: boolean;
  onClose: () => void;
  programs: any[];
  templates: MessageTemplate[];
}) {
  const [audience, setAudience] = useState<BroadcastAudience>({ type: "ALL" });
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [channels, setChannels] = useState<MessageChannel[]>(["IN_APP"]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const createBroadcast = useCreateBroadcast();
  const sendBroadcast = useSendBroadcast();
  const audienceCount = useAudienceCount();

  useEffect(() => {
    if (audience.type) {
      audienceCount.mutate(audience);
    }
  }, [audience]);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setContent(template.content);
      setChannels(template.channels);
    }
    setSelectedTemplate(templateId);
  };

  const handleSend = async () => {
    try {
      const broadcast = await createBroadcast.mutateAsync({
        subject: subject || undefined,
        content,
        audience,
        channels,
      });
      await sendBroadcast.mutateAsync(broadcast.id);
      onClose();
      setContent("");
      setSubject("");
      setAudience({ type: "ALL" });
    } catch (error) {
      console.error("Failed to send broadcast:", error);
    }
  };

  const toggleChannel = (ch: MessageChannel) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="New Broadcast" wide>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-[var(--muted)] mb-1 block">Template (Optional)</label>
          <select
            value={selectedTemplate}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            className="w-full h-9 px-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--input-bg)]"
          >
            <option value="">Select a template...</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--muted)] mb-1 block">Audience</label>
          <div className="grid grid-cols-2 gap-2">
            {(["ALL", "PROGRAM", "STATE", "CUSTOM"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setAudience({ type })}
                className={`p-2 rounded-lg border text-xs font-medium transition ${
                  audience.type === type
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--text)] hover:bg-[var(--muted-bg)]"
                }`}
              >
                {type === "ALL" && "All Borrowers"}
                {type === "PROGRAM" && "By Program"}
                {type === "STATE" && "By State"}
                {type === "CUSTOM" && "Custom Selection"}
              </button>
            ))}
          </div>

          {audience.type === "PROGRAM" && (
            <select
              value={audience.programId || ""}
              onChange={(e) => setAudience({ type: "PROGRAM", programId: e.target.value })}
              className="w-full h-9 px-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--input-bg)] mt-2"
            >
              <option value="">Select program...</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <p className="text-xs text-[var(--muted)] mt-2">
            {audienceCount.isPending ? (
              "Calculating..."
            ) : (
              <span className="font-medium text-[var(--text)]">{audienceCount.data || 0}</span>
            )}{" "}
            recipients
          </p>
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--muted)] mb-1 block">Subject (Optional)</label>
          <Input
            placeholder="Enter subject..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--muted)] mb-1 block">Message</label>
          <textarea
            placeholder="Type your message... Use {{name}}, {{amount}}, {{dueDate}} for personalization"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--input-bg)] resize-none"
          />
          <p className="text-[10px] text-[var(--muted)] mt-1">
            Variables: {"{{name}}"}, {"{{amount}}"}, {"{{farmerId}}"}
          </p>
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--muted)] mb-1 block">Channels</label>
          <div className="flex gap-2">
            {(["IN_APP", "SMS", "WHATSAPP", "EMAIL"] as MessageChannel[]).map((ch) => (
              <button
                key={ch}
                onClick={() => toggleChannel(ch)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  channels.includes(ch)
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--muted-bg)]"
                }`}
              >
                {ch.replace("_", "-")}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSend}
            disabled={!content.trim() || channels.length === 0 || createBroadcast.isPending || sendBroadcast.isPending}
          >
            {createBroadcast.isPending || sendBroadcast.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            Send to {audienceCount.data || 0} recipients
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function TemplateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("CUSTOM");
  const [content, setContent] = useState("");
  const [channels, setChannels] = useState<MessageChannel[]>(["IN_APP"]);

  const createTemplate = useCreateTemplate();

  const handleSave = async () => {
    try {
      await createTemplate.mutateAsync({ name, category, content, channels });
      onClose();
      setName("");
      setContent("");
      setCategory("CUSTOM");
      setChannels(["IN_APP"]);
    } catch (error) {
      console.error("Failed to create template:", error);
    }
  };

  const toggleChannel = (ch: MessageChannel) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="New Template">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-[var(--muted)] mb-1 block">Template Name</label>
          <Input
            placeholder="e.g., Payment Reminder"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--muted)] mb-1 block">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-9 px-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--input-bg)]"
          >
            {TEMPLATE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--muted)] mb-1 block">Content</label>
          <textarea
            placeholder="Type your template... Use {{name}}, {{amount}}, etc. for variables"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--input-bg)] resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--muted)] mb-1 block">Channels</label>
          <div className="flex gap-2">
            {(["IN_APP", "SMS", "WHATSAPP", "EMAIL"] as MessageChannel[]).map((ch) => (
              <button
                key={ch}
                onClick={() => toggleChannel(ch)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  channels.includes(ch)
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--muted-bg)]"
                }`}
              >
                {ch.replace("_", "-")}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={!name.trim() || !content.trim() || channels.length === 0 || createTemplate.isPending}
          >
            {createTemplate.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Create Template
          </Button>
        </div>
      </div>
    </Modal>
  );
}
