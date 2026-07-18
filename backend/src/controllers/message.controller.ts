import { Request, Response } from "express";
import { MessageService } from "../services/message.service";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";

export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const query = {
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    search: req.query.search as string | undefined,
  };
  const result = await MessageService.getConversations(req.user!.sub, req.user!.lenderOrgId || null, query);
  res.json({ success: true, ...result });
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const query = {
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
  };
  const result = await MessageService.getMessages(req.params.conversationId, req.user!.sub, query);
  res.json({ success: true, ...result });
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { content, channel } = req.body;
  if (!content?.trim()) throw ApiError.badRequest("Message content is required");
  const message = await MessageService.sendMessage(req.params.conversationId, req.user!.sub, content, channel);
  res.status(201).json({ success: true, data: message });
});

export const createConversation = asyncHandler(async (req: Request, res: Response) => {
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
});
