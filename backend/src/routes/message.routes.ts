import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { asyncHandler } from "../utils/async-handler";
import { MessageService } from "../services/message.service";
import { ApiError } from "../utils/api-error";
import { messageSendLimiter } from "../middlewares/rate-limiter";

export const messageRouter = Router();

messageRouter.use(authenticate);

// Get conversations
messageRouter.get(
  "/conversations",
  asyncHandler(async (req, res) => {
    const query = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      search: req.query.search as string | undefined,
    };
    const result = await MessageService.getConversations(req.user!.sub, req.user!.lenderOrgId || null, query);
    res.json({ success: true, ...result });
  })
);

// Get messages in conversation
messageRouter.get(
  "/conversations/:conversationId/messages",
  asyncHandler(async (req, res) => {
    const query = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      beforeSeq: req.query.beforeSeq ? parseInt(req.query.beforeSeq as string) : undefined,
    };
    const result = await MessageService.getMessages(req.params.conversationId, req.user!.sub, query);
    res.json({ success: true, ...result });
  })
);

// Send message
messageRouter.post(
  "/conversations/:conversationId/messages",
  messageSendLimiter,
  asyncHandler(async (req, res) => {
    const { content, channel, clientId } = req.body;
    if (typeof content !== "string" || !content.trim()) {
      throw ApiError.badRequest("Content is required");
    }
    if (content.length > 5000) {
      throw ApiError.badRequest("Message is too long (max 5000 characters)");
    }
    if (clientId !== undefined && (typeof clientId !== "string" || clientId.length > 100)) {
      throw ApiError.badRequest("Invalid clientId");
    }

    const message = await MessageService.sendMessage(
      req.params.conversationId,
      req.user!.sub,
      content.trim(),
      channel,
      clientId
    );
    res.status(201).json({ success: true, data: message });
  })
);

// Create conversation
messageRouter.post(
  "/conversations",
  asyncHandler(async (req, res) => {
    const { participantIds, borrowerId } = req.body;

    let conversation;
    if (borrowerId) {
      conversation = await MessageService.getOrCreateConversationWithBorrower(req.user!.sub, borrowerId);
    } else if (participantIds?.length) {
      conversation = await MessageService.createConversation(req.user!.sub, participantIds);
    } else {
      throw ApiError.badRequest("participantIds or borrowerId is required");
    }

    res.status(201).json({ success: true, data: conversation });
  })
);

// Mark conversation as read
messageRouter.post(
  "/conversations/:conversationId/read",
  asyncHandler(async (req, res) => {
    await MessageService.markAsRead(req.params.conversationId, req.user!.sub);
    res.json({ success: true });
  })
);

// Get unread count
messageRouter.get(
  "/unread-count",
  asyncHandler(async (req, res) => {
    const count = await MessageService.getUnreadCount(req.user!.sub);
    res.json({ success: true, data: { count } });
  })
);

// Templates
messageRouter.get(
  "/templates",
  authorize("LENDER_ADMIN", "LENDER_MANAGER", "LENDER_ANALYST"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();

    const templates = await MessageService.getTemplates(lenderOrgId);
    res.json({ success: true, data: templates });
  })
);

messageRouter.post(
  "/templates",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();

    const { name, category, content, channels, variables } = req.body;
    if (!name || !category || !content || !channels?.length) {
      throw ApiError.badRequest("name, category, content, and channels are required");
    }

    const template = await MessageService.createTemplate(
      lenderOrgId,
      { name, category, content, channels, variables },
      req.user!.sub
    );
    res.status(201).json({ success: true, data: template });
  })
);

messageRouter.patch(
  "/templates/:id",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();

    const template = await MessageService.updateTemplate(req.params.id, lenderOrgId, req.body);
    res.json({ success: true, data: template });
  })
);

messageRouter.delete(
  "/templates/:id",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();

    await MessageService.deleteTemplate(req.params.id, lenderOrgId);
    res.json({ success: true });
  })
);

// Broadcasts
messageRouter.get(
  "/broadcasts",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();

    const query = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      status: req.query.status as string | undefined,
    };

    const result = await MessageService.getBroadcasts(lenderOrgId, query);
    res.json({ success: true, ...result });
  })
);

messageRouter.post(
  "/broadcasts",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();

    const { subject, content, audience, channels, scheduledAt } = req.body;
    if (!content || !audience || !channels?.length) {
      throw ApiError.badRequest("content, audience, and channels are required");
    }

    const broadcast = await MessageService.createBroadcast(
      lenderOrgId,
      { subject, content, audience, channels, scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined },
      req.user!.sub
    );
    res.status(201).json({ success: true, data: broadcast });
  })
);

messageRouter.post(
  "/broadcasts/:id/send",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();

    const result = await MessageService.sendBroadcast(req.params.id, lenderOrgId, req.user!.sub);
    res.json({ success: true, data: result });
  })
);

messageRouter.post(
  "/broadcasts/audience-count",
  authorize("LENDER_ADMIN", "LENDER_MANAGER"),
  asyncHandler(async (req, res) => {
    const lenderOrgId = req.user!.lenderOrgId;
    if (!lenderOrgId) throw ApiError.forbidden();

    const { audience } = req.body;
    if (!audience) throw ApiError.badRequest("audience is required");

    const count = await MessageService.getAudienceCount(lenderOrgId, audience);
    res.json({ success: true, data: { count } });
  })
);
