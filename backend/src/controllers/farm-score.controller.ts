import { Request, Response } from "express";
import { FarmScoreService } from "../services/farm-score.service";
import { asyncHandler } from "../utils/async-handler";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";

export const getMyScoreHistory = asyncHandler(async (req: Request, res: Response) => {
  const history = await FarmScoreService.getHistory(req.user!.sub);
  res.json({ success: true, data: history });
});

export const recalculateScore = asyncHandler(async (req: Request, res: Response) => {
  if (req.user!.role !== "SUPER_ADMIN") {
    if (!req.user!.lenderId) throw ApiError.forbidden();
    const borrower = await prisma.borrowerProfile.findFirst({ where: { id: req.params.id, loans: { some: { program: { lenderOrgId: req.user!.lenderId } } } } });
    if (!borrower) throw ApiError.notFound("Borrower not found");
  }
  const result = await FarmScoreService.recalculate(req.params.id);
  res.json({ success: true, data: result });
});
