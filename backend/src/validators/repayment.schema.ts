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
    id: z.string().min(1, "Invalid repayment ID"),
  }),
});

export const listRepaymentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    status: z.enum(["PENDING", "PAID", "OVERDUE", "PARTIAL"]).optional(),
    loanId: z.string().min(1).optional(),
    borrowerId: z.string().min(1).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }),
});

export const verifyCardSchema = z.object({
  body: z.object({
    reference: z.string({ required_error: "Reference is required" }).min(1),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const confirmManualSchema = z.object({
  body: z.object({
    method: z.enum(["BANK_TRANSFER", "USSD"], { required_error: "Method is required" }),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const inKindDeclarationSchema = z.object({
  body: z.object({
    produceType: z.string({ required_error: "Produce type is required" }).min(1).max(100),
    quantityKg: z.number({ required_error: "Quantity is required" }).positive(),
    deliveryLocation: z.string({ required_error: "Delivery location is required" }).min(1).max(300),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type ListRepaymentsInput = z.infer<typeof listRepaymentsSchema>;
