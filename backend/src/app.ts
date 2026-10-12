import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error-handler";
import { auditMiddleware } from "./middlewares/audit";
import { router } from "./routes";
import { ACCESS_COOKIE, REFRESH_COOKIE, readCookie } from "./utils/session-cookies";
import { ApiError } from "./utils/api-error";
import { prisma } from "./config/prisma";
import { redis } from "./config/redis";
import { asyncHandler } from "./utils/async-handler";

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

// Rate limiting (global fallback)
app.use(rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: { success: false, message: "Too many requests, please try again later" },
}));

// Body parsing
declare global { namespace Express { interface Request { rawBody?: string } } }
app.use(express.json({ limit: "10mb", verify: (req, _res, buffer) => { (req as express.Request).rawBody = buffer.toString("utf8"); } }));
app.use(express.urlencoded({ extended: true }));

// Cookies are used only by the configured frontend; reject cross-origin writes.
app.use((req, _res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.headers.origin;
  const usesCookies = readCookie(req.headers.cookie, ACCESS_COOKIE) || readCookie(req.headers.cookie, REFRESH_COOKIE);
  if ((origin && origin !== new URL(env.FRONTEND_URL).origin) || (usesCookies && !origin)) {
    return next(ApiError.forbidden("Request origin is not allowed"));
  }
  next();
});

// Logging
if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Audit logging
app.use(auditMiddleware);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "AgroTrack API is running", timestamp: new Date().toISOString() });
});
app.get("/api/ready", asyncHandler(async (_req, res) => {
  try {
    await Promise.all([prisma.user.count(), redis.ping()]);
    res.json({ success: true, message: "Database schema and session store are ready" });
  } catch { res.status(503).json({ success: false, message: "Database or session store unavailable" }); }
}));

// Routes
app.use("/api", router);

// Error handling
app.use(errorHandler);

export { app };
