import { Router } from "express";
import { ApplicationController } from "../controllers/application.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/async-handler";
import { createApplicationSchema, reviewApplicationSchema, listApplicationsSchema } from "../validators/application.schema";

const router = Router();

// Borrower routes
router.post(
  "/",
  authenticate,
  authorize("BORROWER"),
  validate(createApplicationSchema),
  asyncHandler(ApplicationController.create)
);

router.get(
  "/my",
  authenticate,
  authorize("BORROWER"),
  asyncHandler(ApplicationController.listForBorrower)
);

router.patch(
  "/:id/submit",
  authenticate,
  authorize("BORROWER"),
  asyncHandler(ApplicationController.submit)
);

router.patch(
  "/:id/withdraw",
  authenticate,
  authorize("BORROWER"),
  asyncHandler(ApplicationController.withdraw)
);

// Lender routes
router.get(
  "/",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST"),
  validate(listApplicationsSchema),
  asyncHandler(ApplicationController.listForLender)
);

router.get(
  "/:id",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "BORROWER"),
  asyncHandler(ApplicationController.getById)
);

router.patch(
  "/:id/review",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  validate(reviewApplicationSchema),
  asyncHandler(ApplicationController.review)
);

router.patch(
  "/:id/under-review",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(ApplicationController.markUnderReview)
);

export { router as applicationRoutes };
