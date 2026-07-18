import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import {
  list,
  unreadCount,
  markAsRead,
  markAllAsRead,
  remove,
  getPreferences,
  updatePreferences,
} from "../controllers/notification.controller";

export const notificationRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.get("/preferences", getPreferences);
notificationRouter.patch("/preferences", updatePreferences);
notificationRouter.get("/unread-count", unreadCount);
notificationRouter.patch("/read-all", markAllAsRead);
notificationRouter.get("/", list);
notificationRouter.patch("/:id/read", markAsRead);
notificationRouter.delete("/:id", remove);
