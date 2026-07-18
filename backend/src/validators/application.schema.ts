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

export const RejectionCode = z.enum([
  "INSUFFICIENT_SCORE",
  "UNVERIFIED_IDENTITY",
  "INCOMPLETE_DOCUMENTS",
  "FARM_NOT_VERIFIED",
  "OUTSIDE_ELIGIBILITY",
  "PROGRAM_FUNDS_EXHAUSTED",
  "DUPLICATE_APPLICATION",
  "SUSPICIOUS_ACTIVITY",
  "OTHER",
]);

export const approveApplicationSchema = z.object({
  body: z.object({
    reviewNotes: z.string().max(1000).optional(),
    approvedAmount: z.number().positive().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const rejectApplicationSchema = z.object({
  body: z.object({
    reason: z.string().min(10).max(500),
    rejectionCode: RejectionCode,
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const requestInfoSchema = z.object({
  body: z.object({
    requiredItems: z.array(z.string().min(1)).min(1),
    message: z.string().min(10).max(1000),
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
    state: z.string().optional(),
    minFarmScore: z.coerce.number().int().min(0).max(850).optional(),
    maxFarmScore: z.coerce.number().int().min(0).max(850).optional(),
    agentVerified: z.enum(["true", "false"]).optional(),
    sortBy: z.enum(["newest", "oldest", "highestScore", "highestAmount"]).optional(),
    search: z.string().optional(),
  }),
});

export const bulkActionSchema = z.object({
  body: z.object({
    applicationIds: z.array(z.string().min(1)).min(1).max(100),
    action: z.enum(["APPROVE", "REJECT", "ASSIGN"]),
    rejectionCode: RejectionCode.optional(),
    rejectionReason: z.string().optional(),
    assigneeId: z.string().optional(),
  }),
});

export type ApproveApplicationInput = z.infer<typeof approveApplicationSchema>;
export type RejectApplicationInput = z.infer<typeof rejectApplicationSchema>;
export type RequestInfoInput = z.infer<typeof requestInfoSchema>;
export type BulkActionInput = z.infer<typeof bulkActionSchema>;
