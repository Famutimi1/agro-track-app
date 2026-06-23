import { z } from "zod";

export const createApplicationSchema = z.object({
  body: z.object({
    programId: z.string().min(1),
    amount: z.number().positive(),
    purpose: z.string().min(10).max(500).optional(),
  }),
});

export const updateApplicationSchema = z.object({
  body: z.object({
    amount: z.number().positive().optional(),
    purpose: z.string().min(10).max(500).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const reviewApplicationSchema = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    rejectionReason: z.string().optional(),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listApplicationsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "WITHDRAWN"]).optional(),
    programId: z.string().optional(),
  }),
});
