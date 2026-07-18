import { Router } from "express";
import { LoanController } from "../controllers/loan.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/async-handler";
import {
  listLoansSchema,
  restructureLoanSchema,
  writeOffLoanSchema,
} from "../validators/loan.schema";

const router = Router();

router.use(authenticate);

// List all loans for lender
router.get(
  "/",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  validate(listLoansSchema),
  asyncHandler(LoanController.list)
);

// Get loan portfolio stats
router.get(
  "/stats",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST"),
  asyncHandler(LoanController.getStats)
);

// Get single loan details (lenders see any loan in their org; borrowers only their own — enforced in controller)
router.get(
  "/:id",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER", "BORROWER"),
  asyncHandler(LoanController.getById)
);

// Get repayment schedule for a loan
router.get(
  "/:id/repayment-schedule",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER", "BORROWER"),
  asyncHandler(LoanController.getRepaymentSchedule)
);

// Get loan activity timeline
router.get(
  "/:id/timeline",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER", "BORROWER"),
  asyncHandler(LoanController.getTimeline)
);

// Restructure loan (manager+ only)
router.post(
  "/:id/restructure",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  validate(restructureLoanSchema),
  asyncHandler(LoanController.restructure)
);

// Write off loan (admin only)
router.post(
  "/:id/write-off",
  authorize("LENDER_ADMIN"),
  validate(writeOffLoanSchema),
  asyncHandler(LoanController.writeOff)
);

export { router as loanRoutes };
