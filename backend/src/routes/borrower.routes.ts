import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { getBorrowers, getBorrower, getMyProfile } from "../controllers/borrower.controller";
import { LoanService } from "../services/loan.service";
import { asyncHandler } from "../utils/async-handler";
import { validate } from "../middlewares/validate";
import { z } from "zod";

export const borrowerRouter = Router();

borrowerRouter.use(authenticate);

const loanQuery = z.object({ page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().min(1).max(100).default(20), status: z.enum(["PENDING", "ACTIVE", "COMPLETED", "DEFAULTED", "CANCELLED"]).optional(), programId: z.string().optional() });
borrowerRouter.get("/me/loans", authorize("BORROWER"), validate(loanQuery, "query"), asyncHandler(async (req, res) => { res.json({ success: true, ...await LoanService.list(req.user!, req.query as any) }); }));
borrowerRouter.get("/loans", authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_VIEWER", "LENDER_ANALYST"), validate(loanQuery, "query"), asyncHandler(async (req, res) => { res.json({ success: true, ...await LoanService.list(req.user!, req.query as any) }); }));
borrowerRouter.get("/loans/:id", authorize("BORROWER", "LENDER_ADMIN", "LENDER_MANAGER", "LENDER_VIEWER", "LENDER_ANALYST"), asyncHandler(async (req, res) => { res.json({ success: true, data: await LoanService.get(req.params.id, req.user!) }); }));

borrowerRouter.get("/me", authorize("BORROWER"), getMyProfile);
borrowerRouter.get("/", authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_VIEWER"), getBorrowers);
borrowerRouter.get("/:id", authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_VIEWER", "FIELD_AGENT"), getBorrower);
