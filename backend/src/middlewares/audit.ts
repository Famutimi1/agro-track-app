import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";
import { Prisma } from "@prisma/client";

function redact(value: unknown): Prisma.InputJsonValue | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, /password|token|secret|otp|code|bvn|nin|bankAccount/i.test(key) ? "[REDACTED]" : redact(entry)]));
  return null;
}

const AUDITED_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function auditMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!AUDITED_METHODS.has(req.method)) return next();

  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    const userId = (req as any).user?.sub;
    const pathParts = req.path.split("/").filter(Boolean);
    const resource = pathParts[1] || pathParts[0] || "unknown";
    const resourceId = pathParts[2] || body?.id || null;

    prisma.auditLog
      .create({
        data: {
          userId,
          action: `${req.method} ${req.path}`,
          resource,
          resourceId,
          // Never copy credentials or identity numbers into the audit trail.
          details: req.method === "DELETE" || req.path.startsWith("/api/auth/") ? undefined : {
            body: redact(req.body),
          },
          ipAddress: req.ip || req.socket.remoteAddress || null,
          userAgent: req.get("user-agent") || null,
        },
      })
      .catch((err) => {
        logger.error("Audit log write failed", { error: err.message, path: req.path });
      });

    return originalJson(body);
  };

  next();
}
