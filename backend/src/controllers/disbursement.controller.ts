import { Request, Response } from "express";
import { DisbursementService } from "../services/disbursement.service";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";

export const getDisbursements = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderOrgId) throw ApiError.forbidden();
  const result = await DisbursementService.getAll(req.user.lenderOrgId, req.query as any);
  res.json({ success: true, ...result });
});

export const getPendingDisbursements = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderOrgId) throw ApiError.forbidden();
  const result = await DisbursementService.getPending(req.user.lenderOrgId, req.query as any);
  res.json({ success: true, ...result });
});

export const getDisbursement = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderOrgId) throw ApiError.forbidden();
  const disbursement = await DisbursementService.getById(req.params.id, req.user.lenderOrgId);
  res.json({ success: true, data: disbursement });
});

export const getDisbursementStats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderOrgId) throw ApiError.forbidden();
  const stats = await DisbursementService.getStats(req.user.lenderOrgId);
  res.json({ success: true, data: stats });
});

export const approveDisbursement = asyncHandler(async (req: Request, res: Response) => {
  const d = await DisbursementService.approve(req.params.id, req.user!.sub);
  res.json({ success: true, data: d });
});

export const rejectDisbursement = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body;
  if (!reason) throw ApiError.badRequest("Rejection reason is required");
  const d = await DisbursementService.reject(req.params.id, reason, req.user!.sub);
  res.json({ success: true, data: d });
});

export const retryDisbursement = asyncHandler(async (req: Request, res: Response) => {
  const d = await DisbursementService.retry(req.params.id, req.user!.sub);
  res.json({ success: true, data: d });
});

export const manualReleaseDisbursement = asyncHandler(async (req: Request, res: Response) => {
  const { paymentRef, notes } = req.body;
  if (!paymentRef) throw ApiError.badRequest("Payment reference is required");
  const d = await DisbursementService.manualRelease(req.params.id, req.user!.sub, paymentRef, notes || "");
  res.json({ success: true, data: d });
});

export const bulkApproveDisbursements = asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    throw ApiError.badRequest("ids array is required");
  }
  const result = await DisbursementService.bulkApprove(ids, req.user!.sub);
  res.json({ success: true, data: result });
});

export const bulkRejectDisbursements = asyncHandler(async (req: Request, res: Response) => {
  const { ids, reason } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    throw ApiError.badRequest("ids array is required");
  }
  if (!reason) throw ApiError.badRequest("Rejection reason is required");
  const result = await DisbursementService.bulkReject(ids, reason, req.user!.sub);
  res.json({ success: true, data: result });
});
