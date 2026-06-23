import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { getDisbursements, approveDisbursement, rejectDisbursement } from "../controllers/disbursement.controller";
import {
  approveDisbursementSchema,
  rejectDisbursementSchema,
  listDisbursementsSchema,
} from "../validators/disbursement.schema";

export const disbursementRouter = Router();

disbursementRouter.use(authenticate, authorize("LENDER_ADMIN", "LENDER_MANAGER"));
disbursementRouter.get("/", validate(listDisbursementsSchema), getDisbursements);
disbursementRouter.patch("/:id/approve", validate(approveDisbursementSchema), approveDisbursement);
disbursementRouter.patch("/:id/reject", validate(rejectDisbursementSchema), rejectDisbursement);
