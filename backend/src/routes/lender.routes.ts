import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { getMyOrganization, updateMyOrganization, getDashboard, getTeamMembers } from "../controllers/lender.controller";

export const lenderRouter = Router();

lenderRouter.use(authenticate);
lenderRouter.use(authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_VIEWER"));

lenderRouter.get("/organization", getMyOrganization);
lenderRouter.patch("/organization", authorize("LENDER_ADMIN"), updateMyOrganization);
lenderRouter.get("/dashboard", getDashboard);
lenderRouter.get("/team", getTeamMembers);
