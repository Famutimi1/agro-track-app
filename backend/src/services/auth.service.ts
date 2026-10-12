import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { generateSecret, verify } from "otplib";
import * as QRCode from "qrcode";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { redis } from "../config/redis";
import { ApiError } from "../utils/api-error";
import { Role } from "@prisma/client";
import { logger } from "../config/logger";

const OTP_EXPIRY = 10 * 60; // 10 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60; // 30 minutes

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateAccessToken(payload: { sub: string; email: string; role: Role; lenderId?: string; sid?: string }): string {
    return jwt.sign(payload, env.JWT_SECRET, { algorithm: "HS256", expiresIn: "15m" });
  }

  static generateRefreshToken(): string {
    return crypto.randomBytes(40).toString("hex");
  }

  static async createRefreshToken(userId: string): Promise<string> {
    const token = this.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: { token: this.hashToken(token), userId, expiresAt },
    });

    return token;
  }

  static async revokeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token: this.hashToken(token) } });
  }

  static async revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } });
    logger.warn("All tokens revoked for user", { userId });
  }

  static async validateRefreshToken(token: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: this.hashToken(token) },
      include: { user: true },
    });

    if (!stored || stored.expiresAt <= new Date() || !stored.user.isActive) {
      if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
      throw ApiError.unauthorized("Invalid or expired refresh token");
    }

    return stored.user;
  }

  static async rotateRefreshToken(oldToken: string, userId: string): Promise<string> {
    const token = this.generateRefreshToken();
    const changed = await prisma.refreshToken.updateMany({
      where: { token: this.hashToken(oldToken), userId, expiresAt: { gt: new Date() }, user: { isActive: true } },
      data: { token: this.hashToken(token), expiresAt: new Date(Date.now() + 7 * 86400000) },
    });
    if (changed.count !== 1) throw ApiError.unauthorized("Invalid or already used refresh token");
    return token;
  }

  static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  static async issueSession(user: { id: string; email: string; role: Role; lenderOrgId?: string | null }) {
    const refreshToken = await this.createRefreshToken(user.id);
    const session = await prisma.refreshToken.findUniqueOrThrow({ where: { token: this.hashToken(refreshToken) } });
    const accessToken = this.generateAccessToken({ sub: user.id, email: user.email, role: user.role, lenderId: user.lenderOrgId || undefined, sid: session.id });
    return { accessToken, refreshToken };
  }

  // OTP Methods
  static generateOtp(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  static async sendOtp(phone: string, purpose: "LOGIN" | "VERIFY" | "RESET"): Promise<void> {
    const otp = this.generateOtp();
    const key = `otp:${purpose}:${phone}`;

    await redis.setex(key, OTP_EXPIRY, otp);

    // In production, send via SMS
    logger.info("OTP generated", { phone: phone.slice(0, 4) + "****", purpose });

    // Queue SMS
    const { smsQueue } = await import("../config/queue");
    await smsQueue.add({
      to: phone,
      message: `Your AgroTrack ${purpose} code is: ${otp}. Valid for 10 minutes.`,
    });
  }

  static async verifyOtp(phone: string, otp: string, purpose: "LOGIN" | "VERIFY" | "RESET"): Promise<boolean> {
    const key = `otp:${purpose}:${phone}`;
    const stored = await redis.get(key);

    if (!stored || stored !== otp) {
      return false;
    }

    await redis.del(key);
    return true;
  }

  // 2FA TOTP Methods
  private static async verifyTOTP(token: string, secret: string): Promise<boolean> {
    try {
      const result = await verify({ token, secret });
      return result.valid === true;
    } catch {
      return false;
    }
  }

  static async setup2FA(userId: string): Promise<{ secret: string; qrCode: string }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound("User not found");
    if (user.twoFactorEnabled) throw ApiError.badRequest("2FA already enabled");

    const secret = generateSecret();

    const otpauthUrl = `otpauth://totp/AgroTrack:${encodeURIComponent(user.email)}?secret=${secret}&issuer=AgroTrack`;
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    // Store secret temporarily until verified
    await redis.setex(`2fa:setup:${userId}`, 600, secret);

    return { secret, qrCode };
  }

  static async verify2FASetup(userId: string, token: string): Promise<void> {
    const secret = await redis.get(`2fa:setup:${userId}`);
    if (!secret) throw ApiError.badRequest("2FA setup expired. Please start again.");

    const isValid = await this.verifyTOTP(token, secret);
    if (!isValid) throw ApiError.badRequest("Invalid verification code");

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true, twoFactorSecret: secret },
    });

    await redis.del(`2fa:setup:${userId}`);
    logger.info("2FA enabled", { userId });
  }

  static async verify2FAToken(userId: string, token: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorSecret) return false;

    return this.verifyTOTP(token, user.twoFactorSecret);
  }

  static async disable2FA(userId: string, token: string): Promise<void> {
    const isValid = await this.verify2FAToken(userId, token);
    if (!isValid) throw ApiError.badRequest("Invalid 2FA code");

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });

    logger.info("2FA disabled", { userId });
  }

  // Password Reset
  static async initiatePasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      logger.info("Password reset attempted for unknown email", { email });
      return;
    }

    const code = this.generateOtp();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.passwordReset.create({
      data: { userId: user.id, code, expiresAt },
    });

    // Queue email
    const { emailQueue } = await import("../config/queue");
    await emailQueue.add({
      to: email,
      subject: "Reset Your AgroTrack Password",
      body: `Your password reset code is: ${code}\n\nThis code expires in 30 minutes.\n\nIf you didn't request this, please ignore this email.`,
      name: user.firstName,
    });

    logger.info("Password reset initiated", { userId: user.id });
  }

  static async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw ApiError.badRequest("Invalid reset code");

    const reset = await prisma.passwordReset.findFirst({
      where: {
        userId: user.id,
        code,
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
    });

    if (!reset) throw ApiError.badRequest("Invalid or expired reset code");

    const passwordHash = await this.hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.passwordReset.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      }),
      // Revoke all existing sessions
      prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
    ]);

    logger.info("Password reset completed", { userId: user.id });
  }

  // Login Security
  static async checkLoginAttempts(email: string): Promise<void> {
    const key = `login:attempts:${email}`;
    const attempts = parseInt((await redis.get(key)) || "0");

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      const ttl = await redis.ttl(key);
      throw ApiError.tooManyRequests(
        `Account temporarily locked. Try again in ${Math.ceil(ttl / 60)} minutes.`
      );
    }
  }

  static async recordFailedLogin(email: string): Promise<void> {
    const key = `login:attempts:${email}`;
    const attempts = await redis.incr(key);

    if (attempts === 1) {
      await redis.expire(key, LOCKOUT_DURATION);
    }

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      logger.warn("Account locked due to failed attempts", { email });
    }
  }

  static async clearLoginAttempts(email: string): Promise<void> {
    await redis.del(`login:attempts:${email}`);
  }

  static async updateLastLogin(userId: string, ip?: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ip,
        failedLoginAttempts: 0,
      },
    });
  }

  // Phone Verification
  static async verifyPhone(userId: string, phone: string, otp: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { phone: true } });
    if (user?.phone !== phone) throw ApiError.badRequest("Phone must match your profile");
    const isValid = await this.verifyOtp(phone, otp, "VERIFY");
    if (!isValid) throw ApiError.badRequest("Invalid or expired OTP");

    await prisma.user.update({
      where: { id: userId },
      data: { phoneVerified: true },
    });

    logger.info("Phone verified", { userId });
  }

  // Utilities
  static generateFarmerId(): string {
    const num = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
    return `FMR-${num}`;
  }

  static async blacklistToken(token: string, expiresIn: number): Promise<void> {
    await redis.setex(`blacklist:${token}`, expiresIn, "1");
  }

  static async isTokenBlacklisted(token: string): Promise<boolean> {
    const exists = await redis.exists(`blacklist:${token}`);
    return exists === 1;
  }
}
