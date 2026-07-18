import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { asyncHandler } from "../utils/async-handler";
import { MapService } from "../services/map.service";
import { ApiError } from "../utils/api-error";

const router = Router();

router.use(authenticate);

// Get borrower locations for map
router.get(
  "/borrowers",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();

    const filters = {
      programId: req.query.programId as string | undefined,
      status: req.query.status as string | undefined,
      state: req.query.state as string | undefined,
      minFarmScore: req.query.minFarmScore ? parseInt(req.query.minFarmScore as string) : undefined,
      maxFarmScore: req.query.maxFarmScore ? parseInt(req.query.maxFarmScore as string) : undefined,
      crop: req.query.crop as string | undefined,
      cooperativeId: req.query.cooperativeId as string | undefined,
    };

    const locations = await MapService.getBorrowerLocations(lenderOrgId, filters);
    res.json({ success: true, data: locations });
  })
);

// Get state statistics
router.get(
  "/states",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();

    const stats = await MapService.getStateStats(lenderOrgId);
    res.json({ success: true, data: stats });
  })
);

// Get heatmap data
router.get(
  "/heatmap",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();

    const metric = (req.query.metric as "repayment" | "farmScore" | "density") || "density";
    const data = await MapService.getHeatmapData(lenderOrgId, metric);
    res.json({ success: true, data });
  })
);

// Get map summary
router.get(
  "/summary",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();

    const summary = await MapService.getMapSummary(lenderOrgId);
    res.json({ success: true, data: summary });
  })
);

// Get field agent zones
router.get(
  "/agents",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();

    const zones = await MapService.getFieldAgentZones(lenderOrgId);
    res.json({ success: true, data: zones });
  })
);

// Get available crops
router.get(
  "/crops",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();

    const crops = await MapService.getCrops(lenderOrgId);
    res.json({ success: true, data: crops });
  })
);

export { router as mapRoutes };
