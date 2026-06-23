import { NotificationChannel, NotificationType } from "@prisma/client";
import { prisma } from "../config/prisma";
import { emitToUser } from "../config/socket";
import { emailQueue, smsQueue, pushQueue } from "../config/queue";
import { logger } from "../config/logger";
import { getPagination, paginatedResponse, PaginationQuery } from "../utils/pagination";

interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  channels?: NotificationChannel[];
  data?: Record<string, any>;
  actionUrl?: string;
}

export class NotificationService {
  static async send(payload: NotificationPayload) {
    const channels = payload.channels || ["IN_APP"];

    // Always create in-app notification
    const notification = await prisma.notification.create({
      data: {
        userId: payload.userId,
        title: payload.title,
        body: payload.body,
        type: payload.type,
        channel: "IN_APP",
        data: payload.data,
        actionUrl: payload.actionUrl,
      },
    });

    // Emit real-time update
    emitToUser(payload.userId, "notification", notification);

    // Queue other channels
    for (const channel of channels) {
      if (channel === "EMAIL") {
        await this.queueEmail(payload);
      } else if (channel === "SMS") {
        await this.queueSms(payload);
      } else if (channel === "PUSH") {
        await this.queuePush(payload);
      }
    }

    logger.info("Notification sent", {
      userId: payload.userId,
      type: payload.type,
      channels,
    });

    return notification;
  }

  static async sendBulk(userIds: string[], payload: Omit<NotificationPayload, "userId">) {
    const notifications = await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        title: payload.title,
        body: payload.body,
        type: payload.type,
        channel: "IN_APP",
        data: payload.data,
        actionUrl: payload.actionUrl,
      })),
    });

    // Emit to each user
    for (const userId of userIds) {
      emitToUser(userId, "notification", {
        title: payload.title,
        body: payload.body,
        type: payload.type,
      });
    }

    logger.info("Bulk notification sent", { userCount: userIds.length, type: payload.type });

    return notifications;
  }

  static async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true, readAt: new Date() },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
  }

  static async getUserNotifications(userId: string, query: PaginationQuery & { unreadOnly?: boolean }) {
    const { page, limit, skip } = getPagination(query);
    const where: any = { userId };
    if (query.unreadOnly) where.read = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return {
      ...paginatedResponse(notifications, total, page, limit),
      unreadCount,
    };
  }

  static async delete(id: string, userId: string) {
    return prisma.notification.deleteMany({
      where: { id, userId },
    });
  }

  private static async queueEmail(payload: NotificationPayload) {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { email: true, firstName: true },
    });

    if (user?.email) {
      await emailQueue.add(
        {
          to: user.email,
          subject: payload.title,
          body: payload.body,
          name: user.firstName,
          data: payload.data,
        },
        { attempts: 3, backoff: { type: "exponential", delay: 5000 } }
      );
    }
  }

  private static async queueSms(payload: NotificationPayload) {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { phone: true },
    });

    if (user?.phone) {
      await smsQueue.add(
        {
          to: user.phone,
          message: `${payload.title}: ${payload.body}`,
        },
        { attempts: 3, backoff: { type: "exponential", delay: 5000 } }
      );
    }
  }

  private static async queuePush(payload: NotificationPayload) {
    await pushQueue.add(
      {
        userId: payload.userId,
        title: payload.title,
        body: payload.body,
        data: payload.data,
      },
      { attempts: 3, backoff: { type: "exponential", delay: 5000 } }
    );
  }
}

// Predefined notification templates
export const NotificationTemplates = {
  loanApproved: (loanAmount: number) => ({
    title: "Loan Approved!",
    body: `Your loan application for ₦${loanAmount.toLocaleString()} has been approved.`,
    type: "LOAN_UPDATE" as NotificationType,
  }),

  loanRejected: (reason?: string) => ({
    title: "Loan Application Update",
    body: reason
      ? `Your loan application was not approved. Reason: ${reason}`
      : "Your loan application was not approved at this time.",
    type: "APPLICATION_STATUS" as NotificationType,
  }),

  disbursementReceived: (amount: number, tranche?: number) => ({
    title: "Funds Disbursed",
    body: tranche
      ? `Tranche ${tranche}: ₦${amount.toLocaleString()} has been sent to your account.`
      : `₦${amount.toLocaleString()} has been sent to your account.`,
    type: "DISBURSEMENT" as NotificationType,
  }),

  paymentDue: (amount: number, dueDate: string) => ({
    title: "Payment Reminder",
    body: `Your repayment of ₦${amount.toLocaleString()} is due on ${dueDate}.`,
    type: "PAYMENT_DUE" as NotificationType,
  }),

  paymentReceived: (amount: number) => ({
    title: "Payment Received",
    body: `We received your payment of ₦${amount.toLocaleString()}. Thank you!`,
    type: "PAYMENT_RECEIVED" as NotificationType,
  }),

  farmScoreUpdated: (newScore: number, change: number) => ({
    title: "FarmScore Updated",
    body: `Your FarmScore is now ${newScore} (${change >= 0 ? "+" : ""}${change} points).`,
    type: "FARM_ALERT" as NotificationType,
  }),

  weatherAlert: (title: string, description: string) => ({
    title: `Weather Alert: ${title}`,
    body: description,
    type: "FARM_ALERT" as NotificationType,
  }),
};
