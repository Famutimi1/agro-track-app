import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error-handler";
import { auditMiddleware } from "./middlewares/audit";
import { router } from "./routes";
import { redisEnabled, redisAvailable } from "./config/redis";
import { prisma } from "./config/prisma";

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

// Rate limiting (global fallback) - skip in development
if (env.NODE_ENV === "production") {
  app.use(rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    message: { success: false, message: "Too many requests, please try again later" },
  }));
}

// Body parsing (rawBody is captured for webhook signature verification, e.g. Paystack)
app.use(
  express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Logging
if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Audit logging
app.use(auditMiddleware);

// Health check — reports DB and Redis connectivity so orchestrators and load
// balancers can gate traffic. Multi-instance deploys REQUIRE Redis (the
// Socket.IO adapter and cross-instance delivery depend on it); when Redis is
// enabled but unreachable we report "degraded" so it is visible.
app.get("/api/health", async (_req, res) => {
  let dbOk = true;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbOk = false;
  }

  const redis = {
    enabled: redisEnabled,
    connected: redisEnabled ? redisAvailable : null,
  };

  // Redis is only a hard requirement when explicitly enabled (multi-instance).
  const redisOk = !redisEnabled || redisAvailable;
  const healthy = dbOk && redisOk;

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    status: healthy ? "ok" : "degraded",
    message: "AgroTrack API",
    services: {
      database: dbOk ? "up" : "down",
      redis: redisEnabled ? (redisAvailable ? "up" : "down") : "disabled",
    },
    redis,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api", router);

// Error handling
app.use(errorHandler);

export { app };
