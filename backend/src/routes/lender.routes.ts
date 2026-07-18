import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { asyncHandler } from "../utils/async-handler";
import { LenderService } from "../services/lender.service";
import { ApiError } from "../utils/api-error";

export const lenderRouter = Router();

lenderRouter.use(authenticate);

// Organization
lenderRouter.get(
  "/organization",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    const org = await LenderService.getOrganization(lenderOrgId);
    res.json({ success: true, data: org });
  })
);

lenderRouter.patch(
  "/organization",
  authorize("LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    const org = await LenderService.updateOrganization(lenderOrgId, req.body, req.user!.sub);
    res.json({ success: true, data: org });
  })
);

// Dashboard
lenderRouter.get(
  "/dashboard",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST", "LENDER_VIEWER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    const stats = await LenderService.getDashboardStats(lenderOrgId);
    res.json({ success: true, data: stats });
  })
);

// Team Members
lenderRouter.get(
  "/team",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    const members = await LenderService.getTeamMembers(lenderOrgId);
    res.json({ success: true, data: members });
  })
);

lenderRouter.post(
  "/team",
  authorize("LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();

    const { email, firstName, lastName, role } = req.body;
    if (!email || !firstName || !lastName || !role) {
      throw ApiError.badRequest("email, firstName, lastName, and role are required");
    }

    const member = await LenderService.inviteTeamMember(
      lenderOrgId,
      { email, firstName, lastName, role },
      req.user!.sub
    );
    res.status(201).json({ success: true, data: member });
  })
);

lenderRouter.patch(
  "/team/:memberId",
  authorize("LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();

    const member = await LenderService.updateTeamMember(
      lenderOrgId,
      req.params.memberId,
      req.body,
      req.user!.sub
    );
    res.json({ success: true, data: member });
  })
);

lenderRouter.delete(
  "/team/:memberId",
  authorize("LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();

    await LenderService.removeTeamMember(lenderOrgId, req.params.memberId, req.user!.sub);
    res.json({ success: true });
  })
);

// Notification Settings
lenderRouter.get(
  "/notification-settings",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    const settings = await LenderService.getNotificationSettings(lenderOrgId);
    res.json({ success: true, data: settings });
  })
);

lenderRouter.patch(
  "/notification-settings",
  authorize("LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    const settings = await LenderService.updateNotificationSettings(lenderOrgId, req.body, req.user!.sub);
    res.json({ success: true, data: settings });
  })
);

// Disbursement Rules
lenderRouter.get(
  "/disbursement-rules",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    const rules = await LenderService.getDisbursementRules(lenderOrgId);
    res.json({ success: true, data: rules });
  })
);

lenderRouter.patch(
  "/disbursement-rules",
  authorize("LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    const rules = await LenderService.updateDisbursementRules(lenderOrgId, req.body, req.user!.sub);
    res.json({ success: true, data: rules });
  })
);

// API Keys
lenderRouter.get(
  "/api-keys",
  authorize("LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    const keys = await LenderService.getApiKeys(lenderOrgId);
    res.json({ success: true, data: keys });
  })
);

lenderRouter.post(
  "/api-keys",
  authorize("LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();

    const { name, scopes } = req.body;
    if (!name) throw ApiError.badRequest("name is required");

    const key = await LenderService.createApiKey(lenderOrgId, { name, scopes: scopes || [] }, req.user!.sub);
    res.status(201).json({ success: true, data: key });
  })
);

lenderRouter.delete(
  "/api-keys/:keyId",
  authorize("LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    await LenderService.revokeApiKey(lenderOrgId, req.params.keyId, req.user!.sub);
    res.json({ success: true });
  })
);

// Sessions
lenderRouter.get(
  "/sessions",
  asyncHandler(async (req, res) => {
    const sessions = await LenderService.getActiveSessions(req.user!.sub);
    res.json({ success: true, data: sessions });
  })
);

lenderRouter.delete(
  "/sessions/:sessionId",
  asyncHandler(async (req, res) => {
    await LenderService.revokeSession(req.user!.sub, req.params.sessionId);
    res.json({ success: true });
  })
);

// Billing
lenderRouter.get(
  "/billing",
  authorize("LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    const billing = await LenderService.getBillingInfo(lenderOrgId);
    res.json({ success: true, data: billing });
  })
);

// Integrations
lenderRouter.get(
  "/integrations",
  authorize("LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    const integrations = await LenderService.getIntegrations(lenderOrgId);
    res.json({ success: true, data: integrations });
  })
);

lenderRouter.patch(
  "/integrations/:integration",
  authorize("LENDER_ADMIN"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();
    await LenderService.updateIntegration(lenderOrgId, req.params.integration, req.body, req.user!.sub);
    res.json({ success: true });
  })
);
