import { Router } from "express";
import multer from "multer";
import { ApplicationController } from "../controllers/application.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import {
  createApplicationSchema,
  updateApplicationSchema,
  reviewApplicationSchema,
  listApplicationsSchema,
  approveApplicationSchema,
  rejectApplicationSchema,
  requestInfoSchema,
  bulkActionSchema,
} from "../validators/application.schema";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(ApiError.badRequest("Only JPEG, PNG, and PDF files are allowed"));
    }
  },
});

// ─── Borrower Routes ──────────────────────────────────────────────────────────

// Create a new application
router.post(
  "/",
  authenticate,
  authorize("BORROWER"),
  validate(createApplicationSchema),
  asyncHandler(ApplicationController.create)
);

// List borrower's own applications
router.get(
  "/my",
  authenticate,
  authorize("BORROWER"),
  asyncHandler(ApplicationController.listForBorrower)
);

// Eligibility pre-check for a program
router.get(
  "/eligibility/:programId",
  authenticate,
  authorize("BORROWER"),
  asyncHandler(ApplicationController.getEligibility)
);

// Update a draft application's amount/purpose
router.patch(
  "/:id",
  authenticate,
  authorize("BORROWER"),
  validate(updateApplicationSchema),
  asyncHandler(ApplicationController.update)
);

// Submit draft application
router.patch(
  "/:id/submit",
  authenticate,
  authorize("BORROWER"),
  asyncHandler(ApplicationController.submit)
);

// Withdraw application
router.patch(
  "/:id/withdraw",
  authenticate,
  authorize("BORROWER"),
  asyncHandler(ApplicationController.withdraw)
);

// Upload documents for an application
router.post(
  "/:id/documents",
  authenticate,
  authorize("BORROWER"),
  upload.array("documents", 5),
  asyncHandler(ApplicationController.uploadDocuments)
);

// Respond to a lender's info request
router.post(
  "/:id/respond-info",
  authenticate,
  authorize("BORROWER"),
  asyncHandler(ApplicationController.respondInfo)
);

// ─── Lender Routes ────────────────────────────────────────────────────────────

// List all applications for lender
router.get(
  "/",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  validate(listApplicationsSchema),
  asyncHandler(ApplicationController.listForLender)
);

// Bulk actions (approve, reject, assign)
router.post(
  "/bulk",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  validate(bulkActionSchema),
  asyncHandler(ApplicationController.bulkAction)
);

// Get single application details
router.get(
  "/:id",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER", "BORROWER"),
  asyncHandler(ApplicationController.getById)
);

// Approve application
router.post(
  "/:id/approve",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  validate(approveApplicationSchema),
  asyncHandler(ApplicationController.approve)
);

// Reject application
router.post(
  "/:id/reject",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  validate(rejectApplicationSchema),
  asyncHandler(ApplicationController.reject)
);

// Request more information
router.post(
  "/:id/request-info",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  validate(requestInfoSchema),
  asyncHandler(ApplicationController.requestInfo)
);

// Mark as under review
router.patch(
  "/:id/under-review",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(ApplicationController.markUnderReview)
);

// Legacy review endpoint (kept for backward compatibility)
router.patch(
  "/:id/review",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  validate(reviewApplicationSchema),
  asyncHandler(ApplicationController.review)
);

export { router as applicationRoutes };
