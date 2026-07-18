import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import {
  getMyScoreHistory,
  getMyCurrentScore,
  getScoreBreakdown,
  recalculateScore,
} from "../controllers/farm-score.controller";

export const farmScoreRouter = Router();

farmScoreRouter.use(authenticate);
farmScoreRouter.get("/me", authorize("BORROWER"), getMyCurrentScore);
farmScoreRouter.get("/me/history", authorize("BORROWER"), getMyScoreHistory);
farmScoreRouter.get("/history", authorize("BORROWER"), getMyScoreHistory);
farmScoreRouter.get("/breakdown/:score", authorize("BORROWER"), getScoreBreakdown);
farmScoreRouter.post("/recalculate/:id", authorize("LENDER_ADMIN", "LENDER_MANAGER", "SUPER_ADMIN"), recalculateScore);
