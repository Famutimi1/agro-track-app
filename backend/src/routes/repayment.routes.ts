import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  getRepayments,
  getOverdueRepayments,
  getScheduledRepayments,
  getRepayment,
  getRepaymentStats,
  recordPayment,
  waiveRepayment,
  markRepaymentDefaulted,
  reverseRepayment,
  sendReminders,
  getMyRepayments,
  initiateCardPayment,
  verifyCardPayment,
  verifyCardPaymentByReference,
  paystackWebhook,
  initiateBankTransfer,
  initiateUssd,
  confirmManualPayment,
  declareInKind,
} from "../controllers/repayment.controller";
import {
  recordPaymentSchema,
  listRepaymentsSchema,
  verifyCardSchema,
  confirmManualSchema,
  inKindDeclarationSchema,
} from "../validators/repayment.schema";

export const repaymentRouter = Router();

// Paystack webhook - verified by signature, must stay outside the authenticate gate below
repaymentRouter.post("/webhook/paystack", paystackWebhook);

repaymentRouter.use(authenticate);

// Borrower self-service
repaymentRouter.get("/me", authorize("BORROWER"), getMyRepayments);
repaymentRouter.post("/:id/initiate-card", authorize("BORROWER"), initiateCardPayment);
repaymentRouter.get("/verify-card", authorize("BORROWER"), verifyCardPaymentByReference);
repaymentRouter.post(
  "/:id/verify-card",
  authorize("BORROWER"),
  validate(verifyCardSchema),
  verifyCardPayment
);
repaymentRouter.post("/:id/initiate-bank-transfer", authorize("BORROWER"), initiateBankTransfer);
repaymentRouter.post("/:id/initiate-ussd", authorize("BORROWER"), initiateUssd);
repaymentRouter.post(
  "/:id/confirm-manual",
  authorize("BORROWER"),
  validate(confirmManualSchema),
  confirmManualPayment
);
repaymentRouter.post(
  "/:id/in-kind",
  authorize("BORROWER"),
  validate(inKindDeclarationSchema),
  declareInKind
);

// Read access for all lender roles
repaymentRouter.get(
  "/",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  validate(listRepaymentsSchema),
  getRepayments
);

repaymentRouter.get(
  "/overdue",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  getOverdueRepayments
);

repaymentRouter.get(
  "/scheduled",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  getScheduledRepayments
);

repaymentRouter.get(
  "/stats",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  getRepaymentStats
);

repaymentRouter.get(
  "/:id",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  getRepayment
);

// Record payment - manager+ only
repaymentRouter.post(
  "/:id/pay",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  validate(recordPaymentSchema),
  recordPayment
);

// Waive - manager+ only
repaymentRouter.post(
  "/:id/waive",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  waiveRepayment
);

// Mark defaulted - manager+ only
repaymentRouter.post(
  "/:id/default",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  markRepaymentDefaulted
);

// Reverse - admin only
repaymentRouter.post(
  "/:id/reverse",
  authorize("LENDER_ADMIN"),
  reverseRepayment
);

// Send reminders - manager+ only
repaymentRouter.post(
  "/remind",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  sendReminders
);
