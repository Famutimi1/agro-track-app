import { Request, Response, NextFunction } from "express";
import { ApiKeyService } from "../services/apikey.service";
import { ApiError } from "../utils/api-error";

export async function apiKeyAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer atk_")) {
    throw ApiError.unauthorized("Invalid API key format");
  }

  const key = authHeader.slice(7); // Remove "Bearer "

  const result = await ApiKeyService.validate(key);

  if (!result) {
    throw ApiError.unauthorized("Invalid or expired API key");
  }

  (req as any).apiKey = result;
  (req as any).user = { sub: result.userId };

  next();
}

export function requirePermission(...permissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const apiKey = (req as any).apiKey;

    if (!apiKey) {
      throw ApiError.unauthorized("API key required");
    }

    const hasPermission = permissions.some((p) =>
      apiKey.permissions.includes(p) || apiKey.permissions.includes("*")
    );

    if (!hasPermission) {
      throw ApiError.forbidden(`Missing required permission: ${permissions.join(" or ")}`);
    }

    next();
  };
}
