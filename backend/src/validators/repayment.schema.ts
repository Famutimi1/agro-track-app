import { z } from "zod";

export const recordPaymentSchema = z.object({
  body: z.object({
    amount: z
      .number({ required_error: "Amount is required" })
      .positive("Amount must be positive")
      .max(100000000, "Amount exceeds maximum"),
    method: z.enum(["BANK_TRANSFER", "CARD", "USSD", "CASH", "MOBILE_MONEY"], {
      required_error: "Payment method is required",
    }),
    paymentRef: z.string().optional(),
    notes: z.string().max(500).optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid repayment ID"),
  }),
});

export const listRepaymentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    status: z.enum(["PENDING", "PAID", "OVERDUE", "PARTIAL"]).optional(),
    loanId: z.string().uuid().optional(),
    borrowerId: z.string().uuid().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type ListRepaymentsInput = z.infer<typeof listRepaymentsSchema>;
