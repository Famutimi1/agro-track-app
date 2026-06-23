import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { getBorrowers, getBorrower, getMyProfile } from "../controllers/borrower.controller";

export const borrowerRouter = Router();

borrowerRouter.use(authenticate);

borrowerRouter.get("/me", authorize("BORROWER"), getMyProfile);
borrowerRouter.get("/", authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_VIEWER"), getBorrowers);
borrowerRouter.get("/:id", authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_VIEWER", "FIELD_AGENT"), getBorrower);
