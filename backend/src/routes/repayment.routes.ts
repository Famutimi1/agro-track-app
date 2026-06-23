import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { getRepayments, recordPayment, getMyRepayments } from "../controllers/repayment.controller";
import { recordPaymentSchema, listRepaymentsSchema } from "../validators/repayment.schema";

export const repaymentRouter = Router();

repaymentRouter.use(authenticate);
repaymentRouter.get("/me", authorize("BORROWER"), getMyRepayments);
repaymentRouter.get("/", authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_VIEWER"), validate(listRepaymentsSchema), getRepayments);
repaymentRouter.patch("/:id/pay", authorize("LENDER_ADMIN", "LENDER_MANAGER"), validate(recordPaymentSchema), recordPayment);
