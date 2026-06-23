import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { asyncHandler } from "../utils/async-handler";
import { CooperativeService } from "../services/cooperative.service";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = (req as any).user.lenderId;
    const coop = await CooperativeService.create(lenderOrgId, req.body);
    res.status(201).json({ success: true, data: coop });
  })
);

router.get(
  "/",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    const query = { ...req.query, lenderOrgId: (req as any).user.lenderId } as any;
    const result = await CooperativeService.getAll(query);
    res.json({ success: true, ...result });
  })
);

router.get(
  "/:id",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "COOP_CHAIR", "SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    const coop = await CooperativeService.getById(req.params.id);
    res.json({ success: true, data: coop });
  })
);

router.patch(
  "/:id",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const coop = await CooperativeService.update(req.params.id, req.body);
    res.json({ success: true, data: coop });
  })
);

router.get(
  "/:id/members",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "COOP_CHAIR"),
  asyncHandler(async (req, res) => {
    const result = await CooperativeService.getMembers(req.params.id, req.query as any);
    res.json({ success: true, ...result });
  })
);

router.post(
  "/:id/members",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "COOP_CHAIR"),
  asyncHandler(async (req, res) => {
    const coop = await CooperativeService.addMember(req.params.id, req.body.borrowerId);
    res.json({ success: true, data: coop });
  })
);

router.delete(
  "/:id/members/:borrowerId",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const coop = await CooperativeService.removeMember(req.params.id, req.params.borrowerId);
    res.json({ success: true, data: coop });
  })
);

router.get(
  "/:id/stats",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "COOP_CHAIR"),
  asyncHandler(async (req, res) => {
    const stats = await CooperativeService.getStats(req.params.id);
    res.json({ success: true, data: stats });
  })
);

router.patch(
  "/:id/suspend",
  authenticate,
  authorize("LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const coop = await CooperativeService.suspend(req.params.id);
    res.json({ success: true, data: coop });
  })
);

router.patch(
  "/:id/reactivate",
  authenticate,
  authorize("LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const coop = await CooperativeService.reactivate(req.params.id);
    res.json({ success: true, data: coop });
  })
);

export { router as cooperativeRoutes };
