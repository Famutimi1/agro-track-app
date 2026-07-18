import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/auth";

export const dashboardRouter = Router();

// All routes require authentication
dashboardRouter.use(authenticate);

// GET /api/v1/dashboard - Get all dashboard data at once
dashboardRouter.get("/", dashboardController.getAll);

// GET /api/v1/dashboard/stats - Get KPI stats only
dashboardRouter.get("/stats", dashboardController.getStats);

// GET /api/v1/dashboard/trends - Get disbursement vs repayment trends
// Query params: months (default: 12)
dashboardRouter.get("/trends", dashboardController.getTrends);

// GET /api/v1/dashboard/crop-distribution - Get portfolio by crop type
dashboardRouter.get("/crop-distribution", dashboardController.getCropDistribution);

// GET /api/v1/dashboard/state-performance - Get repayment rate by state
dashboardRouter.get("/state-performance", dashboardController.getStatePerformance);

// GET /api/v1/dashboard/recent-activity - Get recent activity feed
// Query params: limit (default: 20)
dashboardRouter.get("/recent-activity", dashboardController.getRecentActivity);

// GET /api/v1/dashboard/at-risk-borrowers - Get borrowers needing attention
// Query params: limit (default: 10)
dashboardRouter.get("/at-risk-borrowers", dashboardController.getAtRiskBorrowers);
