import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  getDisbursements,
  getPendingDisbursements,
  getDisbursement,
  getDisbursementStats,
  approveDisbursement,
  rejectDisbursement,
  retryDisbursement,
  manualReleaseDisbursement,
  bulkApproveDisbursements,
  bulkRejectDisbursements,
} from "../controllers/disbursement.controller";
import {
  approveDisbursementSchema,
  rejectDisbursementSchema,
  listDisbursementsSchema,
} from "../validators/disbursement.schema";

export const disbursementRouter = Router();

disbursementRouter.use(authenticate);

// Read access for all lender roles
disbursementRouter.get(
  "/",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  validate(listDisbursementsSchema),
  getDisbursements
);

disbursementRouter.get(
  "/pending",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  getPendingDisbursements
);

disbursementRouter.get(
  "/stats",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  getDisbursementStats
);

disbursementRouter.get(
  "/:id",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  getDisbursement
);

// Approval actions - manager+ only
disbursementRouter.post(
  "/:id/approve",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  validate(approveDisbursementSchema),
  approveDisbursement
);

disbursementRouter.post(
  "/:id/reject",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  validate(rejectDisbursementSchema),
  rejectDisbursement
);

disbursementRouter.post(
  "/:id/retry",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  retryDisbursement
);

// Manual release - admin only (emergency override)
disbursementRouter.post(
  "/:id/manual-release",
  authorize("LENDER_ADMIN"),
  manualReleaseDisbursement
);

// Bulk actions - manager+ only
disbursementRouter.post(
  "/bulk/approve",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  bulkApproveDisbursements
);

disbursementRouter.post(
  "/bulk/reject",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  bulkRejectDisbursements
);
