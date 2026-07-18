import { z } from "zod";

const programBodySchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(10).max(2000),
  type: z.enum(["INPUT_CREDIT", "CASH_LOAN", "EQUIPMENT_LEASE", "INSURANCE"]).default("CASH_LOAN"),
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
  trancheCount: z.number().int().min(1).default(1),
  collateralRequired: z.boolean().default(false),
  insuranceRequired: z.boolean().default(false),
  requiredDocuments: z.array(z.string()).default([]),
  totalFund: z.number().positive().optional(),
  minAge: z.number().int().min(18).max(100).optional(),
  maxAge: z.number().int().min(18).max(100).optional(),
  gender: z.enum(["ALL", "FEMALE", "MALE", "YOUTH"]).default("ALL"),
  cooperative: z.enum(["OPTIONAL", "REQUIRED", "NOT_REQUIRED"]).default("OPTIONAL"),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "CLOSED"]).optional(),
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
});

export const createProgramSchema = z.object({
  body: programBodySchema,
});

export const updateProgramSchema = z.object({
  body: programBodySchema.partial(),
  params: z.object({
    id: z.string().min(1),
  }),
});
