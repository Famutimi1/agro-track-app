import { Request, Response } from "express";
import { FarmScoreService } from "../services/farm-score.service";
import { asyncHandler } from "../utils/async-handler";

export const getMyScoreHistory = asyncHandler(async (req: Request, res: Response) => {
  const history = await FarmScoreService.getHistory(req.user!.sub);
  res.json({ success: true, data: history });
});

export const getMyCurrentScore = asyncHandler(async (req: Request, res: Response) => {
  const result = await FarmScoreService.getCurrentScore(req.user!.sub);
  res.json({ success: true, data: result });
});

export const getScoreBreakdown = asyncHandler(async (req: Request, res: Response) => {
  const score = Number(req.params.score);
  const result = FarmScoreService.getScoreBreakdown(score);
  res.json({ success: true, data: result });
});

export const recalculateScore = asyncHandler(async (req: Request, res: Response) => {
  const result = await FarmScoreService.recalculate(req.params.id);
  res.json({ success: true, data: result });
});
