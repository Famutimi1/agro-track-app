import { z } from "zod";

export const approveDisbursementSchema = z.object({
  params: z.object({
    id: z.string().min(1).max(100),
  }),
  body: z
    .object({
      notes: z.string().max(500).optional(),
    })
    .optional(),
});

export const rejectDisbursementSchema = z.object({
  params: z.object({
    id: z.string().min(1).max(100),
  }),
  body: z.object({
    reason: z
      .string({ required_error: "Rejection reason is required" })
      .min(10, "Reason must be at least 10 characters")
      .max(500, "Reason must be at most 500 characters"),
  }),
});

export const processDisbursementSchema = z.object({
  params: z.object({
    id: z.string().min(1).max(100),
  }),
  body: z.object({
    paymentRef: z
      .string({ required_error: "Payment reference is required" })
      .min(5, "Payment reference too short")
      .max(100, "Payment reference too long"),
  }),
});

export const listDisbursementsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    status: z.enum(["PENDING", "APPROVED", "PROCESSING", "COMPLETED", "FAILED"]).optional(),
    loanId: z.string().min(1).max(100).optional(),
  }),
});

export const getTrancheStatusSchema = z.object({
  params: z.object({
    loanId: z.string().min(1).max(100),
  }),
});

export type ApproveDisbursementInput = z.infer<typeof approveDisbursementSchema>;
export type RejectDisbursementInput = z.infer<typeof rejectDisbursementSchema>;
export type ProcessDisbursementInput = z.infer<typeof processDisbursementSchema>;
export type ListDisbursementsInput = z.infer<typeof listDisbursementsSchema>;
