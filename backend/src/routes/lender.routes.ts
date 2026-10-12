import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { getMyOrganization, updateMyOrganization, getDashboard, getTeamMembers } from "../controllers/lender.controller";
import { validate } from "../middlewares/validate";
import { z } from "zod";

export const lenderRouter = Router();

lenderRouter.use(authenticate);
lenderRouter.use(authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_VIEWER", "LENDER_ANALYST"));

lenderRouter.get("/organization", getMyOrganization);
lenderRouter.patch("/organization", authorize("LENDER_ADMIN"), validate(z.object({ name: z.string().min(2).max(200).optional(), email: z.string().email().optional(), phone: z.string().max(20).optional(), address: z.string().max(500).optional(), website: z.string().url().optional(), logoUrl: z.string().url().optional() })), updateMyOrganization);
lenderRouter.get("/dashboard", getDashboard);
lenderRouter.get("/team", getTeamMembers);
