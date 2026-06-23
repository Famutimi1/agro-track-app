import { Request, Response, NextFunction } from "express";
import { redis } from "../config/redis";
import { logger } from "../config/logger";

export function cache(ttlSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") return next();

    const key = `cache:${req.originalUrl}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch {
      return next();
    }

    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      redis.setex(key, ttlSeconds, JSON.stringify(body)).catch((err) => {
        logger.warn("Cache write failed", { key, error: err.message });
      });
      return originalJson(body);
    };

    next();
  };
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    logger.warn("Cache invalidation failed", { pattern, error: (err as Error).message });
  }
}
