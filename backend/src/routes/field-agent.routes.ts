import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { asyncHandler } from "../utils/async-handler";
import { FieldAgentService } from "../services/field-agent.service";

const router = Router();

// Admin routes
router.post(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const agent = await FieldAgentService.create(req.body);
    res.status(201).json({ success: true, data: agent });
  })
);

router.get(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const result = await FieldAgentService.getAll(req.query as any);
    res.json({ success: true, ...result });
  })
);

router.get(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN", "LENDER_ADMIN", "LENDER_MANAGER", "FIELD_SUPERVISOR"),
  asyncHandler(async (req, res) => {
    const agent = await FieldAgentService.getById(req.params.id);
    res.json({ success: true, data: agent });
  })
);

router.patch(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN", "LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const agent = await FieldAgentService.update(req.params.id, req.body);
    res.json({ success: true, data: agent });
  })
);

// Field agent's own routes
router.get(
  "/me/profile",
  authenticate,
  authorize("FIELD_AGENT"),
  asyncHandler(async (req, res) => {
    const agent = await FieldAgentService.getByUserId((req as any).user.sub);
    res.json({ success: true, data: agent });
  })
);

router.get(
  "/me/dashboard",
  authenticate,
  authorize("FIELD_AGENT"),
  asyncHandler(async (req, res) => {
    const dashboard = await FieldAgentService.getDashboard((req as any).user.sub);
    res.json({ success: true, data: dashboard });
  })
);

router.get(
  "/me/visits",
  authenticate,
  authorize("FIELD_AGENT"),
  asyncHandler(async (req, res) => {
    const result = await FieldAgentService.getVisits((req as any).user.sub, req.query as any);
    res.json({ success: true, ...result });
  })
);

router.post(
  "/me/visits",
  authenticate,
  authorize("FIELD_AGENT"),
  asyncHandler(async (req, res) => {
    const visit = await FieldAgentService.recordVisit((req as any).user.sub, req.body);
    res.status(201).json({ success: true, data: visit });
  })
);

router.post(
  "/me/visits/schedule",
  authenticate,
  authorize("FIELD_AGENT"),
  asyncHandler(async (req, res) => {
    const visit = await FieldAgentService.scheduleVisit((req as any).user.sub, req.body);
    res.status(201).json({ success: true, data: visit });
  })
);

// Rating
router.post(
  "/:id/rate",
  authenticate,
  authorize("BORROWER", "LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const agent = await FieldAgentService.rateAgent(req.params.id, req.body.rating);
    res.json({ success: true, data: agent });
  })
);

export { router as fieldAgentRoutes };
