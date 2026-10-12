import { z } from "zod";

export const registerLenderSchema = z.object({
  organizationName: z.string().min(2).max(200),
  organizationType: z.string().min(2),
  cacNumber: z.string().optional(),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  password: z.string().min(8).max(100),
});

export const registerBorrowerSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phone: z.string().min(10).max(15),
  email: z.string().email().optional(),
  password: z.string().min(8).max(100),
  bvn: z.string().length(11).optional(),
  nin: z.string().length(11).optional(),
  state: z.string().min(2),
  lga: z.string().min(2),
  farmSizeHa: z.number().positive(),
  primaryCrop: z.string().min(2),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  language: z.string().default("en"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  twoFactorToken: z.string().regex(/^\d{6}$/, "Enter a 6-digit authenticator code").optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8).max(100),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});
