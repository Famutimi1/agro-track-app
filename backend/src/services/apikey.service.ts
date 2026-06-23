import crypto from "crypto";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { logger } from "../config/logger";

export class ApiKeyService {
  static async create(userId: string, data: { name: string; permissions: string[]; expiresAt?: Date }) {
    const rawKey = crypto.randomBytes(32).toString("hex");
    const prefix = rawKey.slice(0, 8);
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        name: data.name,
        keyHash,
        prefix,
        permissions: data.permissions,
        expiresAt: data.expiresAt,
      },
    });

    logger.info("API key created", { userId, keyId: apiKey.id });

    // Return full key only once
    return {
      id: apiKey.id,
      name: apiKey.name,
      key: `atk_${rawKey}`,
      prefix,
      permissions: apiKey.permissions,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
    };
  }

  static async list(userId: string) {
    return prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        prefix: true,
        permissions: true,
        lastUsedAt: true,
        expiresAt: true,
        active: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async revoke(userId: string, keyId: string) {
    const key = await prisma.apiKey.findFirst({
      where: { id: keyId, userId },
    });

    if (!key) throw ApiError.notFound("API key not found");

    await prisma.apiKey.update({
      where: { id: keyId },
      data: { active: false },
    });

    logger.info("API key revoked", { userId, keyId });

    return { success: true };
  }

  static async validate(rawKey: string): Promise<{
    userId: string;
    permissions: string[];
  } | null> {
    if (!rawKey.startsWith("atk_")) return null;

    const key = rawKey.slice(4);
    const keyHash = crypto.createHash("sha256").update(key).digest("hex");

    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash },
      include: { user: { select: { id: true, role: true, isActive: true } } },
    });

    if (!apiKey) return null;
    if (!apiKey.active) return null;
    if (!apiKey.user.isActive) return null;
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

    // Update last used
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      userId: apiKey.userId,
      permissions: apiKey.permissions,
    };
  }

  static async delete(userId: string, keyId: string) {
    const key = await prisma.apiKey.findFirst({
      where: { id: keyId, userId },
    });

    if (!key) throw ApiError.notFound("API key not found");

    await prisma.apiKey.delete({ where: { id: keyId } });

    logger.info("API key deleted", { userId, keyId });

    return { success: true };
  }
}
