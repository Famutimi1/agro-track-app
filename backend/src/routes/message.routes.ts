import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { getConversations, getMessages, sendMessage, createConversation } from "../controllers/message.controller";

export const messageRouter = Router();

messageRouter.use(authenticate);
messageRouter.get("/conversations", getConversations);
messageRouter.get("/conversations/:conversationId/messages", getMessages);
messageRouter.post("/conversations/:conversationId/messages", sendMessage);
messageRouter.post("/conversations", createConversation);
