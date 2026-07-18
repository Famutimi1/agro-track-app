import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = {
    page: req.query.page as string | undefined,
    limit: req.query.limit as string | undefined,
    unreadOnly: req.query.unreadOnly === "true",
  };
  const result = await NotificationService.getUserNotifications(req.user!.sub, query);
  res.json({ success: true, ...result });
});

export const unreadCount = asyncHandler(async (req: Request, res: Response) => {
  const result = await NotificationService.getUserNotifications(req.user!.sub, { unreadOnly: true, limit: "1" });
  res.json({ success: true, data: { count: result.unreadCount } });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  await NotificationService.markAsRead(req.params.id, req.user!.sub);
  res.json({ success: true });
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await NotificationService.markAllAsRead(req.user!.sub);
  res.json({ success: true });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await NotificationService.delete(req.params.id, req.user!.sub);
  res.json({ success: true });
});

export const getPreferences = asyncHandler(async (req: Request, res: Response) => {
  const matrix = await NotificationService.getPreferences(req.user!.sub);
  res.json({ success: true, data: matrix });
});

export const updatePreferences = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body || typeof req.body !== "object") throw ApiError.badRequest("Preference matrix is required");
  const matrix = await NotificationService.updatePreferences(req.user!.sub, req.body);
  res.json({ success: true, data: matrix });
});
