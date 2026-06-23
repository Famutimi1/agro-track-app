import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

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
          details: req.method === "DELETE" ? undefined : { body: req.body },
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
