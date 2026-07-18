import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";

export const dashboardController = {
  getStats: asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user?.lenderOrgId) {
      throw new ApiError(403, "Access denied. Lender organization required.");
    }

    const stats = await dashboardService.getStats(user.lenderOrgId);

    res.json({
      success: true,
      data: stats,
    });
  }),

  getTrends: asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user?.lenderOrgId) {
      throw new ApiError(403, "Access denied. Lender organization required.");
    }

    const months = parseInt(req.query.months as string) || 12;
    const trends = await dashboardService.getTrends(user.lenderOrgId, months);

    res.json({
      success: true,
      data: trends,
    });
  }),

  getCropDistribution: asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user?.lenderOrgId) {
      throw new ApiError(403, "Access denied. Lender organization required.");
    }

    const distribution = await dashboardService.getCropDistribution(user.lenderOrgId);

    res.json({
      success: true,
      data: distribution,
    });
  }),

  getStatePerformance: asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user?.lenderOrgId) {
      throw new ApiError(403, "Access denied. Lender organization required.");
    }

    const performance = await dashboardService.getStatePerformance(user.lenderOrgId);

    res.json({
      success: true,
      data: performance,
    });
  }),

  getRecentActivity: asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user?.lenderOrgId) {
      throw new ApiError(403, "Access denied. Lender organization required.");
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const activities = await dashboardService.getRecentActivity(user.lenderOrgId, limit);

    res.json({
      success: true,
      data: activities,
    });
  }),

  getAtRiskBorrowers: asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user?.lenderOrgId) {
      throw new ApiError(403, "Access denied. Lender organization required.");
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const borrowers = await dashboardService.getAtRiskBorrowers(user.lenderOrgId, limit);

    res.json({
      success: true,
      data: borrowers,
    });
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user?.lenderOrgId) {
      throw new ApiError(403, "Access denied. Lender organization required.");
    }

    const [stats, trends, cropDistribution, statePerformance, recentActivity, atRiskBorrowers] =
      await Promise.all([
        dashboardService.getStats(user.lenderOrgId),
        dashboardService.getTrends(user.lenderOrgId, 12),
        dashboardService.getCropDistribution(user.lenderOrgId),
        dashboardService.getStatePerformance(user.lenderOrgId),
        dashboardService.getRecentActivity(user.lenderOrgId, 20),
        dashboardService.getAtRiskBorrowers(user.lenderOrgId, 10),
      ]);

    res.json({
      success: true,
      data: {
        stats,
        trends,
        cropDistribution,
        statePerformance,
        recentActivity,
        atRiskBorrowers,
      },
    });
  }),
};
