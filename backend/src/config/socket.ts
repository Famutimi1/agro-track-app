import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import jwt from "jsonwebtoken";
import { env } from "./env";
import { logger } from "./logger";
import { redisEnabled } from "./redis";
import { prisma } from "./prisma";
// Imported for the realtime ack/read/sync handlers. Safe despite the reverse
// import in message.service (it imports emitToConversation from here): both
// sides reference the other only inside runtime functions, never at load time.
import { MessageService } from "../services/message.service";

let io: Server;

// Dedicated pub/sub connections for the Socket.IO Redis adapter. The adapter
// requires its own connections (it puts the subscriber into subscribe mode),
// so we must NOT reuse the shared app Redis client. Kept at module scope so
// they can be closed on shutdown.
let pubClient: Redis | null = null;
let subClient: Redis | null = null;

interface AuthenticatedSocket extends Socket {
  userId?: string;
  role?: string;
  lenderId?: string;
}

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Multi-instance delivery: without the Redis adapter, a `message:new` emitted
  // on instance A never reaches a socket connected to instance B (rooms live in
  // per-process memory). The adapter pub/subs room events through Redis so every
  // instance delivers. Only wired when Redis is enabled; local single-instance
  // dev (REDIS_ENABLED=false) keeps the in-memory adapter.
  if (redisEnabled) {
    try {
      pubClient = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null, lazyConnect: false });
      subClient = pubClient.duplicate();
      pubClient.on("error", (err) => logger.warn("Socket adapter pub client error", { error: err.message }));
      subClient.on("error", (err) => logger.warn("Socket adapter sub client error", { error: err.message }));
      io.adapter(createAdapter(pubClient, subClient));
      logger.info("Socket.IO Redis adapter enabled (multi-instance delivery)");
    } catch (err) {
      logger.error("Failed to enable Socket.IO Redis adapter — falling back to single-instance", {
        error: (err as Error).message,
      });
    }
  } else {
    logger.warn(
      "Socket.IO running with in-memory adapter (REDIS_ENABLED=false). Cross-instance delivery will NOT work; single instance only."
    );
  }

  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        sub: string;
        role: string;
        lenderId?: string;
      };

      socket.userId = decoded.sub;
      socket.role = decoded.role;
      socket.lenderId = decoded.lenderId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    logger.info("Socket connected", { userId: socket.userId, socketId: socket.id });

    // Join user-specific room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Join lender org room for lender users
    if (socket.lenderId) {
      socket.join(`lender:${socket.lenderId}`);
    }

    // Join role-based rooms
    if (socket.role) {
      socket.join(`role:${socket.role}`);
    }

    socket.on("disconnect", () => {
      logger.info("Socket disconnected", { userId: socket.userId, socketId: socket.id });
    });

    socket.on("join:conversation", async (conversationId: string) => {
      if (typeof conversationId !== "string" || !conversationId) return;
      if (await canJoinRoom(socket, `conversation:${conversationId}`)) {
        socket.join(`conversation:${conversationId}`);
      } else {
        logger.warn("Socket denied conversation join", { userId: socket.userId, conversationId });
      }
    });

    socket.on("leave:conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // ── Phase 3: delivery guarantees & receipts ──────────────────────────────

    // Recipient's client acknowledges receipt of a message → mark DELIVERED and
    // notify the conversation room so the sender's tick advances live.
    socket.on("message:ack", async (payload: { messageId?: string }) => {
      if (!socket.userId || !payload?.messageId) return;
      try {
        const conversationId = await MessageService.markDelivered(payload.messageId, socket.userId);
        if (conversationId) {
          io.to(`conversation:${conversationId}`).emit("message:delivered", {
            conversationId,
            messageId: payload.messageId,
          });
        }
      } catch (err) {
        logger.warn("message:ack failed", { userId: socket.userId, error: (err as Error).message });
      }
    });

    // Recipient opened the thread → mark inbound messages READ and push a live
    // read receipt to the room so the sender's ticks turn blue in realtime.
    socket.on("message:read", async (payload: { conversationId?: string }) => {
      if (!socket.userId || !payload?.conversationId) return;
      try {
        const result = await MessageService.markConversationRead(payload.conversationId, socket.userId);
        if (result && result.messageIds.length > 0) {
          io.to(`conversation:${result.conversationId}`).emit("message:read", {
            conversationId: result.conversationId,
            messageIds: result.messageIds,
            readerId: socket.userId,
          });
        }
      } catch (err) {
        logger.warn("message:read failed", { userId: socket.userId, error: (err as Error).message });
      }
    });

    // Reconnect catch-up: client sends the last seq it has for a conversation;
    // server streams anything newer via a Socket.IO ack callback. Closes the
    // "disconnected at emit time" gap deterministically. Participant-guarded in
    // the service layer.
    socket.on(
      "conversation:sync",
      async (
        payload: { conversationId?: string; lastSeq?: number },
        ack?: (messages: unknown[]) => void
      ) => {
        if (!socket.userId || !payload?.conversationId || typeof ack !== "function") return;
        try {
          const messages = await MessageService.getMessagesSince(
            payload.conversationId,
            socket.userId,
            payload.lastSeq ?? 0
          );
          ack(messages);
        } catch (err) {
          logger.warn("conversation:sync failed", { userId: socket.userId, error: (err as Error).message });
          ack([]);
        }
      }
    );

    // Generic room join/leave used by frontend hooks (e.g. conversation:*,
    // lender:*, borrower:*, agent:*). Authorization is enforced here: with the
    // Redis adapter live, joining a room is enough to receive everything emitted
    // to it across ALL instances, so an unauthorized join would leak another
    // user's or conversation's messages. Unknown/unauthorized rooms are denied.
    socket.on("join", async (room: string) => {
      if (typeof room !== "string" || room.length === 0) return;
      if (await canJoinRoom(socket, room)) {
        socket.join(room);
      } else {
        logger.warn("Socket denied room join", { userId: socket.userId, room });
      }
    });

    socket.on("leave", (room: string) => {
      if (typeof room === "string" && room.length > 0) {
        socket.leave(room);
      }
    });
  });

  logger.info("Socket.IO initialized");

  return io;
}

/**
 * Authorizes a socket to join a namespaced room. Each prefix has its own
 * ownership rule; unknown prefixes are denied by default (fail-closed).
 *
 *  - user:<id>          only that user
 *  - lender:<orgId>     only a socket whose JWT carries that lenderId
 *  - conversation:<id>  only a participant of that conversation
 *  - borrower:<id>      the borrower themselves, or any lender user
 *  - agent:<id>         only that agent (its own user id)
 *  - role:<role>        only a socket that holds that role
 */
async function canJoinRoom(socket: AuthenticatedSocket, room: string): Promise<boolean> {
  const sep = room.indexOf(":");
  if (sep === -1) return false;
  const prefix = room.slice(0, sep);
  const id = room.slice(sep + 1);
  if (!id) return false;

  switch (prefix) {
    case "user":
      return socket.userId === id;

    case "lender":
      return !!socket.lenderId && socket.lenderId === id;

    case "role":
      return socket.role === id;

    case "agent":
      // Agent rooms are keyed by the agent's own user id.
      return socket.userId === id;

    case "borrower": {
      // The borrower may join their own room; any lender user may observe.
      if (socket.role && socket.role.startsWith("LENDER_")) return true;
      if (!socket.userId) return false;
      const profile = await prisma.borrowerProfile.findFirst({
        where: { id, userId: socket.userId },
        select: { id: true },
      });
      return !!profile;
    }

    case "conversation": {
      if (!socket.userId) return false;
      const convo = await prisma.conversation.findFirst({
        where: { id, participants: { some: { id: socket.userId } } },
        select: { id: true },
      });
      return !!convo;
    }

    default:
      return false;
  }
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

// Close the adapter's dedicated Redis connections on graceful shutdown.
export async function closeSocketRedis(): Promise<void> {
  await Promise.all([
    pubClient?.quit().catch(() => {}),
    subClient?.quit().catch(() => {}),
  ]);
  pubClient = null;
  subClient = null;
}

export function emitToUser(userId: string, event: string, data: any): void {
  io?.to(`user:${userId}`).emit(event, data);
}

export function emitToLender(lenderId: string, event: string, data: any): void {
  io?.to(`lender:${lenderId}`).emit(event, data);
}

export function emitToConversation(conversationId: string, event: string, data: any): void {
  io?.to(`conversation:${conversationId}`).emit(event, data);
}

export function emitToRole(role: string, event: string, data: any): void {
  io?.to(`role:${role}`).emit(event, data);
}
