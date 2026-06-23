import { Request, Response } from "express";
import { AdminService } from "../services/admin.service";
import { asyncHandler } from "../utils/async-handler";

export const getPlatformStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await AdminService.getPlatformStats();
  res.json({ success: true, data: stats });
});

export const getLenderAccounts = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getLenderAccounts(req.query as any);
  res.json({ success: true, ...result });
});

export const getTickets = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getTickets(req.query as any);
  res.json({ success: true, ...result });
});

export const getFeatureFlags = asyncHandler(async (_req: Request, res: Response) => {
  const flags = await AdminService.getFeatureFlags();
  res.json({ success: true, data: flags });
});

export const toggleFeatureFlag = asyncHandler(async (req: Request, res: Response) => {
  const flag = await AdminService.toggleFeatureFlag(req.params.id);
  res.json({ success: true, data: flag });
});

export const getAuditLog = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getAuditLog(req.query as any);
  res.json({ success: true, ...result });
});
