import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { LoanService } from "../services/loan.service";
import { DisbursementService } from "../services/disbursement.service";
import { asyncHandler } from "../utils/async-handler";
import { validate } from "../middlewares/validate";
import { getDisbursements, approveDisbursement, rejectDisbursement } from "../controllers/disbursement.controller";
import {
  approveDisbursementSchema,
  rejectDisbursementSchema,
  listDisbursementsSchema,
} from "../validators/disbursement.schema";

export const disbursementRouter = Router();

disbursementRouter.use(authenticate);
disbursementRouter.get("/loan/:loanId", asyncHandler(async (req, res) => {
  const loan = await LoanService.get(req.params.loanId, req.user!);
  res.json({ success: true, data: loan.disbursements });
}));
disbursementRouter.get("/loan/:loanId/tranches", asyncHandler(async (req, res) => {
  await LoanService.get(req.params.loanId, req.user!);
  res.json({ success: true, data: await DisbursementService.getTrancheStatus(req.params.loanId) });
}));
disbursementRouter.use(authorize("LENDER_ADMIN", "LENDER_MANAGER"));
disbursementRouter.get("/", validate(listDisbursementsSchema), getDisbursements);
disbursementRouter.patch("/:id/approve", validate(approveDisbursementSchema), approveDisbursement);
disbursementRouter.patch("/:id/reject", validate(rejectDisbursementSchema), rejectDisbursement);
