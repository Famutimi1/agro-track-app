import { Request, Response } from "express";
import { RepaymentService } from "../services/repayment.service";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";

export const getRepayments = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.lenderId) throw ApiError.forbidden();
  const result = await RepaymentService.getAll(req.user.lenderId, req.query as any);
  res.json({ success: true, ...result });
});

export const recordPayment = asyncHandler(async (req: Request, res: Response) => {
  const { amount, method } = req.body;
  if (!amount || !method) throw ApiError.badRequest("Amount and method are required");
  const repayment = await RepaymentService.recordPayment(req.params.id, amount, method);
  res.json({ success: true, data: repayment });
});

export const getMyRepayments = asyncHandler(async (req: Request, res: Response) => {
  const repayments = await RepaymentService.getBorrowerRepayments(req.user!.sub);
  res.json({ success: true, data: repayments });
});
