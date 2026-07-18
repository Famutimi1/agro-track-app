import { Request, Response } from "express";
import { RepaymentService } from "../services/repayment.service";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";

export const getRepayments = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderOrgId) throw ApiError.forbidden();
  const result = await RepaymentService.getAll(req.user.lenderOrgId, req.query as any);
  res.json({ success: true, ...result });
});

export const getOverdueRepayments = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderOrgId) throw ApiError.forbidden();
  const result = await RepaymentService.getOverdue(req.user.lenderOrgId, req.query as any);
  res.json({ success: true, ...result });
});

export const getScheduledRepayments = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderOrgId) throw ApiError.forbidden();
  const result = await RepaymentService.getScheduled(req.user.lenderOrgId, req.query as any);
  res.json({ success: true, ...result });
});

export const getRepayment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderOrgId) throw ApiError.forbidden();
  const repayment = await RepaymentService.getById(req.params.id, req.user.lenderOrgId);
  res.json({ success: true, data: repayment });
});

export const getRepaymentStats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderOrgId) throw ApiError.forbidden();
  const stats = await RepaymentService.getStats(req.user.lenderOrgId);
  res.json({ success: true, data: stats });
});

export const recordPayment = asyncHandler(async (req: Request, res: Response) => {
  const { amount, method, reference, paidAt, receiptUrl } = req.body;
  if (!amount || !method) throw ApiError.badRequest("Amount and method are required");

  const repayment = await RepaymentService.recordPayment(
    req.params.id,
    { amount, method, reference, paidAt: paidAt ? new Date(paidAt) : undefined, receiptUrl },
    req.user!.sub
  );
  res.json({ success: true, data: repayment });
});

export const waiveRepayment = asyncHandler(async (req: Request, res: Response) => {
  const { reason, waivedAmount } = req.body;
  if (!reason) throw ApiError.badRequest("Waiver reason is required");

  const repayment = await RepaymentService.waive(
    req.params.id,
    { reason, waivedAmount },
    req.user!.sub
  );
  res.json({ success: true, data: repayment });
});

export const markRepaymentDefaulted = asyncHandler(async (req: Request, res: Response) => {
  const repayment = await RepaymentService.markDefaulted(req.params.id, req.user!.sub);
  res.json({ success: true, data: repayment });
});

export const reverseRepayment = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body;
  if (!reason) throw ApiError.badRequest("Reversal reason is required");

  const repayment = await RepaymentService.reverse(req.params.id, reason, req.user!.sub);
  res.json({ success: true, data: repayment });
});

export const sendReminders = asyncHandler(async (req: Request, res: Response) => {
  const { borrowerIds, message, channels } = req.body;
  if (!Array.isArray(borrowerIds) || borrowerIds.length === 0) {
    throw ApiError.badRequest("borrowerIds array is required");
  }
  if (!Array.isArray(channels) || channels.length === 0) {
    throw ApiError.badRequest("channels array is required");
  }

  const result = await RepaymentService.sendReminders(borrowerIds, message, channels, req.user!.sub);
  res.json({ success: true, data: result });
});

export const getMyRepayments = asyncHandler(async (req: Request, res: Response) => {
  const repayments = await RepaymentService.getBorrowerRepayments(req.user!.sub);
  res.json({ success: true, data: repayments });
});

export const initiateCardPayment = asyncHandler(async (req: Request, res: Response) => {
  const result = await RepaymentService.initiateCardPayment(req.params.id, req.user!.sub);
  res.json({ success: true, data: result });
});

export const verifyCardPayment = asyncHandler(async (req: Request, res: Response) => {
  const repayment = await RepaymentService.verifyCardPayment(req.params.id, req.user!.sub, req.body.reference);
  res.json({ success: true, data: repayment });
});

export const verifyCardPaymentByReference = asyncHandler(async (req: Request, res: Response) => {
  const repayment = await RepaymentService.verifyCardPaymentByReference(req.user!.sub, req.query.reference as string);
  res.json({ success: true, data: repayment });
});

export const paystackWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers["x-paystack-signature"] as string;
  await RepaymentService.handlePaystackWebhook((req as any).rawBody ?? JSON.stringify(req.body), signature);
  res.json({ success: true });
});

export const initiateBankTransfer = asyncHandler(async (req: Request, res: Response) => {
  const result = await RepaymentService.initiateBankTransfer(req.params.id, req.user!.sub);
  res.json({ success: true, data: result });
});

export const initiateUssd = asyncHandler(async (req: Request, res: Response) => {
  const result = await RepaymentService.initiateUssd(req.params.id, req.user!.sub);
  res.json({ success: true, data: result });
});

export const confirmManualPayment = asyncHandler(async (req: Request, res: Response) => {
  const repayment = await RepaymentService.confirmManualPayment(req.params.id, req.user!.sub, req.body.method);
  res.json({ success: true, data: repayment });
});

export const declareInKind = asyncHandler(async (req: Request, res: Response) => {
  const { produceType, quantityKg, deliveryLocation } = req.body;
  const repayment = await RepaymentService.declareInKind(req.params.id, req.user!.sub, {
    produceType,
    quantityKg,
    deliveryLocation,
  });
  res.json({ success: true, data: repayment });
});
