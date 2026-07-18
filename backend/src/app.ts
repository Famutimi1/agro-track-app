import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error-handler";
import { auditMiddleware } from "./middlewares/audit";
import { router } from "./routes";

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

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "AgroTrack API is running", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api", router);

// Error handling
app.use(errorHandler);

export { app };
