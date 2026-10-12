import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { verifyAccessSession } from "../middlewares/auth";
import { ACCESS_COOKIE, readCookie } from "../utils/session-cookies";
import { prisma } from "./prisma";
import { env } from "./env";
import { logger } from "./logger";

let io: Server;

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

  io.use(async (socket: AuthenticatedSocket, next) => {
    if (socket.handshake.headers.origin !== new URL(env.FRONTEND_URL).origin) return next(new Error("Origin not allowed"));
    const token = socket.handshake.auth.token || readCookie(socket.handshake.headers.cookie, ACCESS_COOKIE);

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = await verifyAccessSession(token);

      socket.userId = decoded.sub;
      socket.role = decoded.role;
      socket.lenderId = decoded.lenderId;
      socket.join(`session:${decoded.sid}`);
      const claims = jwt.decode(token) as jwt.JwtPayload;
      const timer = setTimeout(() => socket.disconnect(true), Math.max(0, (claims.exp! * 1000) - Date.now()));
      timer.unref();
      socket.on("disconnect", () => clearTimeout(timer));
      socket.use((_packet, packetNext) => { verifyAccessSession(token).then(() => packetNext()).catch(() => { socket.disconnect(true); packetNext(new Error("Session revoked")); }); });
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
      if (typeof conversationId !== "string") return;
      try {
        const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, participants: { some: { id: socket.userId } } } });
        if (conversation) socket.join(`conversation:${conversationId}`);
      } catch { socket.emit("error", { message: "Unable to join conversation" }); }
    });

    socket.on("leave:conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });
  });

  logger.info("Socket.IO initialized");

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
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

export function disconnectSessionSockets(sessionId: string): void {
  io?.in(`session:${sessionId}`).disconnectSockets(true);
}
