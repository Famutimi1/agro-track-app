import { z } from "zod";

export const createProgramSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(10).max(2000),
  interestRate: z.number().min(0).max(100),
  maxAmount: z.number().positive(),
  minAmount: z.number().positive(),
  durationMonths: z.number().int().positive(),
  requiredScore: z.number().int().min(0).max(850).default(0),
  targetCrops: z.array(z.string()).default([]),
  targetStates: z.array(z.string()).default([]),
  maxBorrowers: z.number().int().positive().optional(),
  gracePeriodDays: z.number().int().min(0).default(0),
  disbursementType: z.enum(["FULL", "TRANCHE"]).default("FULL"),
  collateralRequired: z.boolean().default(false),
});

export const updateProgramSchema = createProgramSchema.partial();
