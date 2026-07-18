import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { asyncHandler } from "../utils/async-handler";
import { FieldAgentService } from "../services/field-agent.service";
import { ApiError } from "../utils/api-error";

const router = Router();

router.use(authenticate);

// Stats - for lender dashboard
router.get(
  "/stats",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  asyncHandler(async (req, res) => {
    const stats = await FieldAgentService.getStats();
    res.json({ success: true, data: stats });
  })
);

// List all agents
router.get(
  "/",
  authorize("SUPER_ADMIN", "LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  asyncHandler(async (req, res) => {
    const result = await FieldAgentService.getAll(req.query as any);
    res.json({ success: true, ...result });
  })
);

// Create new agent
router.post(
  "/",
  authorize("SUPER_ADMIN", "LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const agent = await FieldAgentService.create(req.body);
    res.status(201).json({ success: true, data: agent });
  })
);

// Get single agent
router.get(
  "/:id",
  authorize("SUPER_ADMIN", "LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER", "FIELD_SUPERVISOR"),
  asyncHandler(async (req, res) => {
    const agent = await FieldAgentService.getById(req.params.id);
    res.json({ success: true, data: agent });
  })
);

// Update agent
router.patch(
  "/:id",
  authorize("SUPER_ADMIN", "LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const agent = await FieldAgentService.update(req.params.id, req.body);
    res.json({ success: true, data: agent });
  })
);

// Activate agent
router.post(
  "/:id/activate",
  authorize("LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const agent = await FieldAgentService.activate(req.params.id, req.user!.sub);
    res.json({ success: true, data: agent });
  })
);

// Deactivate agent
router.post(
  "/:id/deactivate",
  authorize("LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const { reason } = req.body;
    if (!reason) throw ApiError.badRequest("Deactivation reason is required");
    const agent = await FieldAgentService.deactivate(req.params.id, reason, req.user!.sub);
    res.json({ success: true, data: agent });
  })
);

// Get agent tasks
router.get(
  "/:id/tasks",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "FIELD_SUPERVISOR"),
  asyncHandler(async (req, res) => {
    const result = await FieldAgentService.getTasks(req.params.id, req.query as any);
    res.json({ success: true, ...result });
  })
);

// Assign task to agent
router.post(
  "/:id/tasks",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "FIELD_SUPERVISOR"),
  asyncHandler(async (req, res) => {
    const task = await FieldAgentService.assignTask(req.params.id, req.body, req.user!.sub);
    res.status(201).json({ success: true, data: task });
  })
);

// Get agent earnings
router.get(
  "/:id/earnings",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const earnings = await FieldAgentService.getEarnings(req.params.id);
    res.json({ success: true, data: earnings });
  })
);

// Approve payout
router.post(
  "/:id/payout",
  authorize("LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) throw ApiError.badRequest("Valid payout amount is required");
    const result = await FieldAgentService.approvePayout(req.params.id, amount, req.user!.sub);
    res.json({ success: true, data: result });
  })
);

// Get agent verifications
router.get(
  "/:id/verifications",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST"),
  asyncHandler(async (req, res) => {
    const result = await FieldAgentService.getVerifications(req.params.id, req.query as any);
    res.json({ success: true, ...result });
  })
);

// Get quality samples for review
router.get(
  "/:id/quality-samples",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const count = req.query.count ? parseInt(req.query.count as string) : 5;
    const samples = await FieldAgentService.getQualitySamples(req.params.id, count);
    res.json({ success: true, data: samples });
  })
);

// Rate a verification
router.post(
  "/verifications/:visitId/rate",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const { rating, notes } = req.body;
    if (!rating) throw ApiError.badRequest("Rating is required");
    const result = await FieldAgentService.rateVerification(
      req.params.visitId,
      rating,
      notes || "",
      req.user!.sub
    );
    res.json({ success: true, data: result });
  })
);

// Rate agent (by borrower or lender)
router.post(
  "/:id/rate",
  authorize("BORROWER", "LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const agent = await FieldAgentService.rateAgent(req.params.id, req.body.rating);
    res.json({ success: true, data: agent });
  })
);

// ─── FIELD AGENT'S OWN ROUTES ────────────────────────────────────────────────

router.get(
  "/me/profile",
  authorize("FIELD_AGENT"),
  asyncHandler(async (req, res) => {
    const agent = await FieldAgentService.getByUserId(req.user!.sub);
    res.json({ success: true, data: agent });
  })
);

router.get(
  "/me/dashboard",
  authorize("FIELD_AGENT"),
  asyncHandler(async (req, res) => {
    const dashboard = await FieldAgentService.getDashboard(req.user!.sub);
    res.json({ success: true, data: dashboard });
  })
);

router.get(
  "/me/visits",
  authorize("FIELD_AGENT"),
  asyncHandler(async (req, res) => {
    const result = await FieldAgentService.getVisits(req.user!.sub, req.query as any);
    res.json({ success: true, ...result });
  })
);

router.post(
  "/me/visits",
  authorize("FIELD_AGENT"),
  asyncHandler(async (req, res) => {
    const visit = await FieldAgentService.recordVisit(req.user!.sub, req.body);
    res.status(201).json({ success: true, data: visit });
  })
);

router.post(
  "/me/visits/schedule",
  authorize("FIELD_AGENT"),
  asyncHandler(async (req, res) => {
    const visit = await FieldAgentService.scheduleVisit(req.user!.sub, req.body);
    res.status(201).json({ success: true, data: visit });
  })
);

export { router as fieldAgentRoutes };
