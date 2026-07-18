import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { asyncHandler } from "../utils/async-handler";
import { CooperativeService } from "../services/cooperative.service";
import { ApiError } from "../utils/api-error";

const router = Router();

router.use(authenticate);

// Create cooperative
router.post(
  "/",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    const coop = await CooperativeService.create(lenderOrgId, req.body, req.user!.sub);
    res.status(201).json({ success: true, data: coop });
  })
);

// List cooperatives
router.get(
  "/",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER", "SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    const query = { ...req.query, lenderOrgId: req.user!.lenderOrgId } as any;
    const result = await CooperativeService.getAll(query);
    res.json({ success: true, ...result });
  })
);

// Get single cooperative
router.get(
  "/:id",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER", "COOP_CHAIR", "SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    const coop = await CooperativeService.getById(req.params.id);
    res.json({ success: true, data: coop });
  })
);

// Update cooperative
router.patch(
  "/:id",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const coop = await CooperativeService.update(req.params.id, req.body);
    res.json({ success: true, data: coop });
  })
);

// Get members
router.get(
  "/:id/members",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER", "COOP_CHAIR"),
  asyncHandler(async (req, res) => {
    const result = await CooperativeService.getMembers(req.params.id, req.query as any);
    res.json({ success: true, ...result });
  })
);

// Add member
router.post(
  "/:id/members",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "COOP_CHAIR"),
  asyncHandler(async (req, res) => {
    const { borrowerId } = req.body;
    if (!borrowerId) throw ApiError.badRequest("borrowerId is required");
    const coop = await CooperativeService.addMember(req.params.id, borrowerId, req.user!.sub);
    res.json({ success: true, data: coop });
  })
);

// Remove member
router.delete(
  "/:id/members/:borrowerId",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const { reason } = req.body || {};
    const coop = await CooperativeService.removeMember(
      req.params.id,
      req.params.borrowerId,
      req.user!.sub,
      reason
    );
    res.json({ success: true, data: coop });
  })
);

// Get loans for cooperative
router.get(
  "/:id/loans",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  asyncHandler(async (req, res) => {
    const result = await CooperativeService.getLoans(req.params.id, req.query as any);
    res.json({ success: true, ...result });
  })
);

// Get stats
router.get(
  "/:id/stats",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER", "COOP_CHAIR"),
  asyncHandler(async (req, res) => {
    const stats = await CooperativeService.getStats(req.params.id);
    res.json({ success: true, data: stats });
  })
);

// Get group FarmScore
router.get(
  "/:id/score",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER", "COOP_CHAIR"),
  asyncHandler(async (req, res) => {
    const score = await CooperativeService.getGroupScore(req.params.id);
    res.json({ success: true, data: score });
  })
);

// Suspend cooperative
router.post(
  "/:id/suspend",
  authorize("LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const { reason } = req.body;
    if (!reason) throw ApiError.badRequest("Suspension reason is required");
    const coop = await CooperativeService.suspend(req.params.id, req.user!.sub, reason);
    res.json({ success: true, data: coop });
  })
);

// Reactivate cooperative
router.post(
  "/:id/reactivate",
  authorize("LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const coop = await CooperativeService.reactivate(req.params.id, req.user!.sub);
    res.json({ success: true, data: coop });
  })
);

// Dissolve cooperative
router.post(
  "/:id/dissolve",
  authorize("LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const { reason } = req.body;
    if (!reason) throw ApiError.badRequest("Dissolution reason is required");
    const result = await CooperativeService.dissolve(req.params.id, req.user!.sub, reason);
    res.json({ success: true, data: result });
  })
);

export { router as cooperativeRoutes };
