import { Request, Response } from "express";
import { LenderService } from "../services/lender.service";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";

export const getMyOrganization = asyncHandler(async (req: Request, res: Response) => {
  const lenderOrgId = req.user?.lenderOrgId || req.user?.lenderId;
  if (!lenderOrgId) throw ApiError.forbidden("Not associated with a lender organization");
  const org = await LenderService.getOrganization(lenderOrgId);
  res.json({ success: true, data: org });
});

export const updateMyOrganization = asyncHandler(async (req: Request, res: Response) => {
  const lenderOrgId = req.user?.lenderOrgId || req.user?.lenderId;
  if (!lenderOrgId) throw ApiError.forbidden("Not associated with a lender organization");
  const org = await LenderService.updateOrganization(lenderOrgId, req.body, req.user!.sub);
  res.json({ success: true, data: org });
});

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const lenderOrgId = req.user?.lenderOrgId || req.user?.lenderId;
  if (!lenderOrgId) throw ApiError.forbidden("Not associated with a lender organization");
  const stats = await LenderService.getDashboardStats(lenderOrgId);
  res.json({ success: true, data: stats });
});

export const getTeamMembers = asyncHandler(async (req: Request, res: Response) => {
  const lenderOrgId = req.user?.lenderOrgId || req.user?.lenderId;
  if (!lenderOrgId) throw ApiError.forbidden("Not associated with a lender organization");
  const members = await LenderService.getTeamMembers(lenderOrgId);
  res.json({ success: true, data: members });
});
