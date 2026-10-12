import { io, Socket } from "socket.io-client";
import { useRealtimeStore, useNotificationsStore } from "../stores";
import { Notification } from "../api";
import { Message } from "../api/messages";

let socket: Socket | null = null;

const isBrowser = typeof window !== "undefined";

export interface SocketEvents {
  notification: (data: Notification) => void;
  "loan:updated": (data: { loanId: string; status: string }) => void;
  "application:updated": (data: { applicationId: string; status: string }) => void;
  "disbursement:processed": (data: { disbursementId: string; loanId: string }) => void;
  "repayment:received": (data: { repaymentId: string; loanId: string; amount: number }) => void;
  "farm-report:verified": (data: { reportId: string; borrowerId: string }) => void;
  "farm-score:updated": (data: { borrowerId: string; score: number; tier: string }) => void;
  "field-visit:assigned": (data: { visitId: string; agentId: string }) => void;
  "message:new": (data: Message) => void;
  "message:delivered": (data: { conversationId: string; messageId: string }) => void;
  "message:read": (data: { conversationId: string; messageIds: string[]; readerId: string }) => void;
  typing: (data: { conversationId: string; userId: string; isTyping: boolean }) => void;
}

export function getSocket(): Socket | null {
  return socket;
}

export function initSocket(serverUrl?: string): Socket | null {
  if (!isBrowser) {
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  const url = serverUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return null;
  }

  socket = io(url, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  const realtimeStore = useRealtimeStore.getState();
  const notificationsStore = useNotificationsStore.getState();

  socket.on("connect", () => {
    realtimeStore.setConnected(true);
    realtimeStore.setConnectionError(null);

    // Re-join rooms after reconnection
    const rooms = useRealtimeStore.getState().subscribedRooms;
    rooms.forEach((room) => {
      socket?.emit("join", room);
    });
  });

  socket.on("disconnect", (reason) => {
    realtimeStore.setConnected(false);
    if (reason === "io server disconnect") {
      // Server disconnected us, try to reconnect
      socket?.connect();
    }
  });

  socket.on("connect_error", (error) => {
    realtimeStore.setConnectionError(error.message);
    realtimeStore.setConnected(false);
  });

  // Handle incoming notifications
  socket.on("notification", (data: Notification) => {
    notificationsStore.addNotification(data);
    realtimeStore.setLastEventAt(new Date().toISOString());
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    useRealtimeStore.getState().setConnected(false);
    useRealtimeStore.getState().clearRooms();
  }
}

// Re-authenticate the live socket after a token refresh. A long-lived socket
// otherwise keeps the JWT claims it connected with, so a refreshed role/lender
// (or an expired original token) would go stale. We swap the auth token and
// force a reconnect; the "connect" handler re-joins all tracked rooms. No-op if
// no socket exists yet (next initSocket picks up the new token from storage).
export function reauthenticateSocket(): void {
  if (!socket) return;
  const token = localStorage.getItem("accessToken");
  if (!token) return;
  socket.auth = { token };
  socket.disconnect().connect();
}

export function joinRoom(room: string): void {
  if (socket?.connected) {
    socket.emit("join", room);
    useRealtimeStore.getState().addRoom(room);
  }
}

export function leaveRoom(room: string): void {
  if (socket?.connected) {
    socket.emit("leave", room);
    useRealtimeStore.getState().removeRoom(room);
  }
}

// ── Phase 3 client→server emits ──────────────────────────────────────────────

// Acknowledge receipt of a message so the server marks it DELIVERED.
export function ackMessageDelivered(messageId: string): void {
  socket?.emit("message:ack", { messageId });
}

// Tell the server this conversation has been read (pushes a live read receipt).
export function emitConversationRead(conversationId: string): void {
  socket?.emit("message:read", { conversationId });
}

// Notify the other participant(s) that this user is (or has stopped) typing.
// Ephemeral — the server relays it to the conversation room without persisting.
export function emitTyping(conversationId: string, isTyping: boolean): void {
  socket?.emit(isTyping ? "typing:start" : "typing:stop", { conversationId });
}

// Reconnect catch-up: ask the server for any messages newer than lastSeq.
// Resolves with the missed messages via the Socket.IO ack callback.
export function syncConversation(
  conversationId: string,
  lastSeq: number
): Promise<Message[]> {
  return new Promise((resolve) => {
    if (!socket?.connected) {
      resolve([]);
      return;
    }
    socket.emit("conversation:sync", { conversationId, lastSeq }, (messages: Message[]) => {
      resolve(Array.isArray(messages) ? messages : []);
    });
  });
}

export function subscribeToEvent<K extends keyof SocketEvents>(
  event: K,
  callback: SocketEvents[K]
): () => void {
  if (!socket) {
    return () => {};
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socket.on(event as string, callback as any);

  return () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket?.off(event as string, callback as any);
  };
}

export function setupAuthSubscription(): () => void {
  if (!isBrowser) {
    return () => {};
  }

  const { useAuthStore } = require("../stores");

  const unsubscribe = useAuthStore.subscribe(
    (state: { isAuthenticated: boolean }, prevState: { isAuthenticated: boolean }) => {
      if (state.isAuthenticated && !prevState.isAuthenticated) {
        initSocket();
      } else if (!state.isAuthenticated && prevState.isAuthenticated) {
        disconnectSocket();
      }
    }
  );

  return unsubscribe;
}
