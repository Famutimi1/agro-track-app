import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { asyncHandler } from "../utils/async-handler";
import { CooperativeService } from "../services/cooperative.service";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { validate } from "../middlewares/validate";
import { z } from "zod";

const router = Router();
const coopFields = z.object({ name: z.string().min(2).max(200), state: z.string().min(2).max(100), lga: z.string().max(100).optional(), address: z.string().max(500).optional(), regNumber: z.string().max(100).optional(), maxMembers: z.number().int().positive().max(10000).optional() });

router.use("/:id", authenticate, asyncHandler(async (req, _res, next) => {
  const user = req.user!;
  const coop = await prisma.cooperative.findFirst({ where: { id: req.params.id, ...(user.role === "SUPER_ADMIN" ? {} : user.role === "COOP_CHAIR" ? { chairPersonId: user.sub } : user.role.startsWith("LENDER_") && user.lenderId ? { lenderOrgId: user.lenderId } : { id: "__denied__" }) } });
  if (!coop) throw ApiError.notFound("Cooperative not found");
  if (req.body.borrowerId || req.params.borrowerId) {
    const borrowerId = req.body.borrowerId || req.params.borrowerId;
    const borrower = await prisma.borrowerProfile.findFirst({ where: { id: borrowerId, OR: [ { cooperativeId: coop.id }, { loans: { some: { program: { lenderOrgId: coop.lenderOrgId || "__unassigned__" } } } }, { applications: { some: { program: { lenderOrgId: coop.lenderOrgId || "__unassigned__" } } } } ] } });
    if (!borrower) throw ApiError.notFound("Borrower not found");
  }
  next();
}));

router.post(
  "/",
  authenticate,
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  validate(coopFields),
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
  validate(coopFields.partial()),
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
