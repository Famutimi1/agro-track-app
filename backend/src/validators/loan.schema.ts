import { z } from "zod";

export const listLoansSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    status: z.enum(["PENDING", "ACTIVE", "COMPLETED", "DEFAULTED", "CANCELLED"]).optional(),
    programId: z.string().optional(),
    state: z.string().optional(),
    borrowerId: z.string().optional(),
    minAmount: z.coerce.number().positive().optional(),
    maxAmount: z.coerce.number().positive().optional(),
    sortBy: z.enum(["newest", "oldest", "highestAmount", "lowestAmount", "nextPayment"]).optional(),
    search: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }),
});

export const restructureLoanSchema = z.object({
  body: z.object({
    reason: z.string().min(10, "Reason must be at least 10 characters"),
    extensionMonths: z.number().int().min(1).max(24),
    newMonthlyAmount: z.number().positive(),
    gracePeriodMonths: z.number().int().min(0).max(6).optional(),
  }),
});

export const writeOffLoanSchema = z.object({
  body: z.object({
    reason: z.string().min(10, "Reason must be at least 10 characters"),
    writeOffAmount: z.number().positive(),
  }),
});
