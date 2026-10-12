import { Request, Response, NextFunction } from "express";
import { redis } from "../config/redis";
import { ApiError } from "../utils/api-error";

interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
  message?: string;
}

export function rateLimiter(config: RateLimitConfig) {
  const { windowMs, max, message = "Too many requests, please try again later" } = config;
  const windowSec = Math.ceil(windowMs / 1000);

  return async (req: Request, _res: Response, next: NextFunction) => {
    const key = config.keyGenerator
      ? `rl:${config.keyGenerator(req)}`
      : `rl:${req.path}:${req.ip}`;

    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSec);
      }

      if (current > max) {
        throw ApiError.tooManyRequests(message);
      }
    } catch (err) {
      if (err instanceof ApiError) { next(err); return; }
      // If Redis is down, allow the request
    }

    next();
  };
}

export const loginLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => `login:${req.ip}`,
  message: "Too many login attempts. Try again in 15 minutes.",
});

export const otpLimiter = rateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => `otp:${req.body.phone || req.ip}`,
  message: "Too many OTP requests. Try again in 5 minutes.",
});

export const registerLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => `register:${req.ip}`,
  message: "Too many registration attempts. Try again in 1 hour.",
});

export const uploadLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => `upload:${(req as any).user?.sub || req.ip}`,
  message: "Upload limit reached. Try again in 1 hour.",
});

export const generalLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => `general:${(req as any).user?.sub || req.ip}`,
});
