import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { asyncHandler } from "../utils/async-handler";
import { LoanController } from "../controllers/loan.controller";
import {
  getBorrowers,
  getBorrower,
  getMyProfile,
  getBorrowerLoans,
  getBorrowerFarmReports,
  getBorrowerFarmScore,
  getBorrowerDocuments,
  getBorrowerActivity,
  flagBorrower,
  blacklistBorrower,
  unblacklistBorrower,
} from "../controllers/borrower.controller";

export const borrowerRouter = Router();

borrowerRouter.use(authenticate);

// Borrower own profile
borrowerRouter.get("/me", authorize("BORROWER"), getMyProfile);

// Borrower's own loans (must be registered before "/:id/loans" to avoid shadowing)
borrowerRouter.get("/me/loans", authorize("BORROWER"), asyncHandler(LoanController.listMine));

// Lender endpoints for borrower management
borrowerRouter.get(
  "/",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  getBorrowers
);

borrowerRouter.get(
  "/:id",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER", "FIELD_AGENT"),
  getBorrower
);

borrowerRouter.get(
  "/:id/loans",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  getBorrowerLoans
);

borrowerRouter.get(
  "/:id/farm-reports",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  getBorrowerFarmReports
);

borrowerRouter.get(
  "/:id/farmscore",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  getBorrowerFarmScore
);

borrowerRouter.get(
  "/:id/documents",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  getBorrowerDocuments
);

borrowerRouter.get(
  "/:id/activity",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  getBorrowerActivity
);

// Management actions (manager+ only)
borrowerRouter.post(
  "/:id/flag",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  flagBorrower
);

borrowerRouter.post(
  "/:id/blacklist",
  authorize("LENDER_ADMIN"),
  blacklistBorrower
);

borrowerRouter.post(
  "/:id/unblacklist",
  authorize("LENDER_ADMIN"),
  unblacklistBorrower
);
