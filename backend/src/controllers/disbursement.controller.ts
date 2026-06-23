import { Request, Response } from "express";
import { DisbursementService } from "../services/disbursement.service";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";

export const getDisbursements = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderId) throw ApiError.forbidden();
  const result = await DisbursementService.getAll(req.user.lenderId, req.query as any);
  res.json({ success: true, ...result });
});

export const approveDisbursement = asyncHandler(async (req: Request, res: Response) => {
  const d = await DisbursementService.approve(req.params.id, req.user!.sub);
  res.json({ success: true, data: d });
});

export const rejectDisbursement = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body;
  if (!reason) throw ApiError.badRequest("Rejection reason is required");
  const d = await DisbursementService.reject(req.params.id, reason);
  res.json({ success: true, data: d });
});
