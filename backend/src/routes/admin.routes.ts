import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { getPlatformStats, getLenderAccounts, getTickets, getFeatureFlags, toggleFeatureFlag, getAuditLog } from "../controllers/admin.controller";

export const adminRouter = Router();

adminRouter.use(authenticate, authorize("SUPER_ADMIN"));
adminRouter.get("/stats", getPlatformStats);
adminRouter.get("/lenders", getLenderAccounts);
adminRouter.get("/tickets", getTickets);
adminRouter.get("/feature-flags", getFeatureFlags);
adminRouter.patch("/feature-flags/:id/toggle", toggleFeatureFlag);
adminRouter.get("/audit-log", getAuditLog);
