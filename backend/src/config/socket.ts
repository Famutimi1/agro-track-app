import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
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

    socket.on("join:conversation", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("leave:conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Generic room join/leave used by frontend hooks (e.g. conversation:*, lender:*, borrower:*, agent:*)
    socket.on("join", (room: string) => {
      if (typeof room === "string" && room.length > 0) {
        socket.join(room);
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
