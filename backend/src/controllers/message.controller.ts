import { Request, Response } from "express";
import { MessageService } from "../services/message.service";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";

export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const conversations = await MessageService.getConversations(req.user!.sub);
  res.json({ success: true, data: conversations });
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const messages = await MessageService.getMessages(req.params.conversationId, req.user!.sub);
  res.json({ success: true, data: messages });
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { content } = req.body;
  if (!content?.trim()) throw ApiError.badRequest("Message content is required");
  const message = await MessageService.sendMessage(req.params.conversationId, req.user!.sub, content);
  res.status(201).json({ success: true, data: message });
});

export const createConversation = asyncHandler(async (req: Request, res: Response) => {
  const { participantIds } = req.body;
  if (!participantIds?.length) throw ApiError.badRequest("Participant IDs required");
  const allIds = [...new Set([req.user!.sub, ...participantIds])];
  const conversation = await MessageService.createConversation(allIds);
  res.status(201).json({ success: true, data: conversation });
});
