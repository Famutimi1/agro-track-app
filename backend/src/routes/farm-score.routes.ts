import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { getMyScoreHistory, recalculateScore } from "../controllers/farm-score.controller";

export const farmScoreRouter = Router();

farmScoreRouter.use(authenticate);
farmScoreRouter.get("/history", authorize("BORROWER"), getMyScoreHistory);
farmScoreRouter.post("/recalculate/:id", authorize("LENDER_ADMIN", "LENDER_MANAGER", "SUPER_ADMIN"), recalculateScore);
