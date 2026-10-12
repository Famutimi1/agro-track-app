import { io, Socket } from "socket.io-client";
import { useRealtimeStore, useNotificationsStore } from "../stores";
import { Notification } from "../api";

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

  if (socket) return socket;
  const url = serverUrl || process.env.NEXT_PUBLIC_WS_URL || new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api").origin;

  socket = io(url, {
    withCredentials: true,
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
