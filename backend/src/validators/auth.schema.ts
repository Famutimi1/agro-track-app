import { z } from "zod";

export const registerLenderSchema = z.object({
  body: z.object({
    organizationName: z.string().min(2).max(200),
    organizationType: z.string().min(2),
    cacNumber: z.string().optional(),
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    email: z.string().email(),
    phone: z.string().min(10).max(15),
    password: z.string().min(8).max(100),
  }),
});

export const registerBorrowerSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    phone: z.string().min(10).max(15),
    email: z.string().email().optional(),
    password: z.string().min(6).max(100),
    bvn: z.string().length(11).optional(),
    nin: z.string().length(11).optional(),
    state: z.string().min(2),
    lga: z.string().min(2),
    farmSizeHa: z.number().positive(),
    primaryCrop: z.string().min(2),
    bankName: z.string().optional(),
    bankAccount: z.string().optional(),
    language: z.string().default("en"),
  }),
});

export const updateProfileSchema = z.object({
  body: z
    .object({
      // Common user fields
      firstName: z.string().min(2).max(50).optional(),
      lastName: z.string().min(2).max(50).optional(),
      phone: z.string().min(10).max(15).optional(),
      avatarUrl: z.string().url().optional(),
      // Borrower profile fields
      state: z.string().min(2).optional(),
      lga: z.string().min(2).optional(),
      address: z.string().max(200).optional(),
      farmSizeHa: z.number().positive().optional(),
      primaryCrop: z.string().min(2).optional(),
      bankName: z.string().optional(),
      bankAccount: z.string().optional(),
      language: z.string().optional(),
      // Lender organization fields
      organizationName: z.string().min(2).max(200).optional(),
      organizationPhone: z.string().min(10).max(15).optional(),
      organizationAddress: z.string().max(200).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    code: z.string().length(6),
    newPassword: z.string().min(8).max(100),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});
