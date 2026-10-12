import { Request, Response } from "express";
import { AdminService } from "../services/admin.service";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";

export const getPlatformStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await AdminService.getPlatformStats();
  res.json({ success: true, data: stats });
});

export const getLenderAccounts = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getLenderAccounts(req.query as any);
  res.json({ success: true, ...result });
});

export const getTickets = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getTickets(req.query as any);
  res.json({ success: true, ...result });
});

export const getFeatureFlags = asyncHandler(async (_req: Request, res: Response) => {
  const flags = await AdminService.getFeatureFlags();
  res.json({ success: true, data: flags });
});

export const toggleFeatureFlag = asyncHandler(async (req: Request, res: Response) => {
  const flag = await AdminService.toggleFeatureFlag(req.params.id, {
    id: req.user!.sub,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
  res.json({ success: true, data: flag });
});

export const getAuditLog = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getAuditLog(req.query as any);
  res.json({ success: true, ...result });
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query as { status?: string };
  const isActive =
    status === "active" ? true : status === "inactive" ? false : undefined;

  const result = await AdminService.getUsers({ ...(req.query as any), isActive });
  res.json({ success: true, ...result });
});

export const changeUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.body as { role?: string };
  if (!role) throw ApiError.badRequest("role is required");

  const user = await AdminService.changeUserRole(req.params.id, role, {
    id: req.user!.sub,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
  res.json({ success: true, data: user });
});

export const setUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { isActive } = req.body as { isActive?: boolean };
  if (typeof isActive !== "boolean") throw ApiError.badRequest("isActive (boolean) is required");

  const user = await AdminService.setUserStatus(req.params.id, isActive, {
    id: req.user!.sub,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
  res.json({ success: true, data: user });
});

export const getGrowthAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const data = await AdminService.getGrowthAnalytics(req.query as any);
  res.json({ success: true, data });
});

export const getRevenueStats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await AdminService.getRevenueStats();
  res.json({ success: true, data });
});

export const getSystemHealth = asyncHandler(async (_req: Request, res: Response) => {
  const data = await AdminService.getSystemHealth();
  res.json({ success: true, data });
});

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const data = await AdminService.getSettings();
  res.json({ success: true, data });
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const data = await AdminService.updateSettings(req.body ?? {}, {
    id: req.user!.sub,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
  res.json({ success: true, data });
});

export const getDocuments = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getDocuments(req.query as any);
  res.json({ success: true, ...result });
});

export const verifyDocument = asyncHandler(async (req: Request, res: Response) => {
  const { decision, reason } = req.body as { decision?: string; reason?: string };
  if (decision !== "APPROVED" && decision !== "REJECTED") {
    throw ApiError.badRequest("decision must be APPROVED or REJECTED");
  }

  const doc = await AdminService.verifyDocument(req.params.id, decision, reason, {
    id: req.user!.sub,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
  res.json({ success: true, data: doc });
});

export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const { summary, ...result } = await AdminService.getTransactions(req.query as any);
  res.json({ success: true, ...result, summary });
});

const actorOf = (req: Request) => ({
  id: req.user!.sub,
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});

export const getBroadcasts = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getBroadcasts(req.query as any);
  res.json({ success: true, ...result });
});

export const createBroadcast = asyncHandler(async (req: Request, res: Response) => {
  const { subject, content, audience, channels } = req.body ?? {};
  const broadcast = await AdminService.createBroadcast(
    { subject, content, audience, channels },
    actorOf(req)
  );
  res.status(201).json({ success: true, data: broadcast });
});

export const sendBroadcast = asyncHandler(async (req: Request, res: Response) => {
  const broadcast = await AdminService.sendBroadcast(req.params.id, actorOf(req));
  res.json({ success: true, data: broadcast });
});

export const deleteBroadcast = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.deleteBroadcast(req.params.id, actorOf(req));
  res.json({ success: true, data: result });
});

export const getTemplates = asyncHandler(async (_req: Request, res: Response) => {
  const templates = await AdminService.getTemplates();
  res.json({ success: true, data: templates });
});

export const createTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { name, category, content, channels } = req.body ?? {};
  const template = await AdminService.createTemplate({ name, category, content, channels }, actorOf(req));
  res.status(201).json({ success: true, data: template });
});

export const deleteTemplate = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.deleteTemplate(req.params.id, actorOf(req));
  res.json({ success: true, data: result });
});

export const getWebhooks = asyncHandler(async (_req: Request, res: Response) => {
  const webhooks = await AdminService.getWebhooks();
  res.json({ success: true, data: webhooks });
});

export const createWebhook = asyncHandler(async (req: Request, res: Response) => {
  const { url, events } = req.body ?? {};
  const webhook = await AdminService.createWebhook({ url, events }, actorOf(req));
  res.status(201).json({ success: true, data: webhook });
});

export const toggleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const webhook = await AdminService.toggleWebhook(req.params.id, actorOf(req));
  res.json({ success: true, data: webhook });
});

export const deleteWebhook = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.deleteWebhook(req.params.id, actorOf(req));
  res.json({ success: true, data: result });
});

export const getApiKeys = asyncHandler(async (req: Request, res: Response) => {
  const keys = await AdminService.getApiKeys(req.user!.sub);
  res.json({ success: true, data: keys });
});

export const createApiKey = asyncHandler(async (req: Request, res: Response) => {
  const { name, permissions } = req.body ?? {};
  const key = await AdminService.createApiKey({ name, permissions }, actorOf(req));
  res.status(201).json({ success: true, data: key });
});

export const revokeApiKey = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.revokeApiKey(req.params.id, actorOf(req));
  res.json({ success: true, data: result });
});

export const getTicket = asyncHandler(async (req: Request, res: Response) => {
  const ticket = await AdminService.getTicket(req.params.id);
  res.json({ success: true, data: ticket });
});

export const replyTicket = asyncHandler(async (req: Request, res: Response) => {
  const { body } = req.body as { body?: string };
  if (!body) throw ApiError.badRequest("body is required");

  const ticket = await AdminService.replyTicket(req.params.id, body, {
    id: req.user!.sub,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
  res.json({ success: true, data: ticket });
});

export const updateTicket = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body as { status?: string };
  if (!status) throw ApiError.badRequest("status is required");

  const ticket = await AdminService.updateTicket(req.params.id, { status }, {
    id: req.user!.sub,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
  res.json({ success: true, data: ticket });
});

export const setLenderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body as { status?: string };
  if (!status) throw ApiError.badRequest("status is required");

  const lender = await AdminService.setLenderStatus(req.params.id, status, {
    id: req.user!.sub,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
  res.json({ success: true, data: lender });
});

export const changeLenderPlan = asyncHandler(async (req: Request, res: Response) => {
  const { plan } = req.body as { plan?: string };
  if (!plan) throw ApiError.badRequest("plan is required");

  const lender = await AdminService.changeLenderPlan(req.params.id, plan, {
    id: req.user!.sub,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
  res.json({ success: true, data: lender });
});

// ── Billing ────────────────────────────────────────────────────────────────

export const getSubscriptions = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getSubscriptions(req.query);
  res.json({ success: true, ...result });
});

export const seedSubscriptions = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.seedSubscriptions(actorOf(req));
  res.json({ success: true, data: result });
});

export const getInvoices = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getInvoices(req.query);
  res.json({ success: true, ...result });
});

export const getInvoice = asyncHandler(async (req: Request, res: Response) => {
  const data = await AdminService.getInvoice(req.params.id);
  res.json({ success: true, data });
});

export const generateInvoices = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.generateInvoices(actorOf(req));
  res.json({ success: true, data: result });
});

export const recordPayment = asyncHandler(async (req: Request, res: Response) => {
  const { amount, method, reference } = req.body as {
    amount?: number;
    method?: string;
    reference?: string;
  };
  if (amount === undefined || amount === null) throw ApiError.badRequest("amount is required");
  if (!method) throw ApiError.badRequest("method is required");

  const invoice = await AdminService.recordPayment(
    req.params.id,
    { amount, method, reference },
    actorOf(req)
  );
  res.json({ success: true, data: invoice });
});

export const voidInvoice = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await AdminService.voidInvoice(req.params.id, actorOf(req));
  res.json({ success: true, data: invoice });
});
