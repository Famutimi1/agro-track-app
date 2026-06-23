import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { createFarmReport, getMyFarmReports, getLenderFarmReports } from "../controllers/farm-report.controller";

export const farmReportRouter = Router();

farmReportRouter.use(authenticate);
farmReportRouter.post("/", authorize("BORROWER"), createFarmReport);
farmReportRouter.get("/me", authorize("BORROWER"), getMyFarmReports);
farmReportRouter.get("/", authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_VIEWER", "FIELD_AGENT"), getLenderFarmReports);
