import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { MessageChannel, BroadcastStatus } from "@prisma/client";
import { logger } from "../config/logger";
import { emitToConversation } from "../config/socket";

interface ConversationQuery {
  page?: number;
  limit?: number;
  search?: string;
}

interface BroadcastAudience {
  type: "ALL" | "PROGRAM" | "STATE" | "COOPERATIVE" | "CUSTOM";
  programId?: string;
  state?: string;
  cooperativeId?: string;
  borrowerIds?: string[];
}

export class MessageService {
  static async getConversations(userId: string, lenderOrgId: string | null, query: ConversationQuery = {}) {
    const { page = 1, limit = 50, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      participants: { some: { id: userId } },
    };

    if (search) {
      where.OR = [
        { participants: { some: { firstName: { contains: search, mode: "insensitive" } } } },
        { participants: { some: { lastName: { contains: search, mode: "insensitive" } } } },
      ];
    }

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: {
          participants: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              role: true,
              borrowerProfile: { select: { farmerId: true, farmScore: true } },
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: {
              content: true,
              createdAt: true,
              senderId: true,
              read: true,
              status: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.conversation.count({ where }),
    ]);

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (c) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: c.id,
            senderId: { not: userId },
            read: false,
          },
        });

        const otherParticipant = c.participants.find((p) => p.id !== userId);

        return {
          ...c,
          unreadCount,
          otherParticipant,
          lastMessage: c.messages[0] || null,
        };
      })
    );

    return {
      data: conversationsWithUnread,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getMessages(conversationId: string, userId: string, query: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, participants: { some: { id: userId } } },
    });
    if (!conversation) throw ApiError.notFound("Conversation not found");

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true, readAt: new Date() },
    });

    return {
      data: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    channel: MessageChannel = "IN_APP"
  ) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, participants: { some: { id: senderId } } },
    });
    if (!conversation) throw ApiError.notFound("Conversation not found");

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        channel,
        status: "SENT",
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    logger.info("Message sent", { conversationId, senderId, channel });

    emitToConversation(conversationId, "message:new", message);

    return message;
  }

  static async createConversation(creatorId: string, participantIds: string[]) {
    const allParticipants = [...new Set([creatorId, ...participantIds])];

    const existing = await prisma.conversation.findFirst({
      where: {
        AND: allParticipants.map((id) => ({
          participants: { some: { id } },
        })),
      },
      include: {
        participants: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    if (existing && existing.participants.length === allParticipants.length) {
      return existing;
    }

    return prisma.conversation.create({
      data: {
        participants: { connect: allParticipants.map((id) => ({ id })) },
      },
      include: {
        participants: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
  }

  static async getOrCreateConversationWithBorrower(lenderUserId: string, borrowerId: string) {
    const borrower = await prisma.borrowerProfile.findUnique({
      where: { id: borrowerId },
      select: { userId: true },
    });

    if (!borrower) throw ApiError.notFound("Borrower not found");

    return this.createConversation(lenderUserId, [borrower.userId]);
  }

  // Templates
  static async getTemplates(lenderOrgId: string) {
    return prisma.messageTemplate.findMany({
      where: {
        OR: [{ lenderOrgId }, { isSystem: true }],
      },
      orderBy: [{ isSystem: "desc" }, { category: "asc" }, { name: "asc" }],
    });
  }

  static async createTemplate(
    lenderOrgId: string,
    data: {
      name: string;
      category: string;
      content: string;
      channels: MessageChannel[];
      variables?: string[];
    },
    userId: string
  ) {
    const variables = data.variables || this.extractVariables(data.content);

    return prisma.messageTemplate.create({
      data: {
        lenderOrgId,
        name: data.name,
        category: data.category,
        content: data.content,
        channels: data.channels,
        variables,
        createdBy: userId,
      },
    });
  }

  static async updateTemplate(
    templateId: string,
    lenderOrgId: string,
    data: Partial<{
      name: string;
      category: string;
      content: string;
      channels: MessageChannel[];
    }>
  ) {
    const template = await prisma.messageTemplate.findFirst({
      where: { id: templateId, lenderOrgId, isSystem: false },
    });

    if (!template) throw ApiError.notFound("Template not found or cannot be edited");

    const variables = data.content ? this.extractVariables(data.content) : undefined;

    return prisma.messageTemplate.update({
      where: { id: templateId },
      data: {
        ...data,
        ...(variables && { variables }),
      },
    });
  }

  static async deleteTemplate(templateId: string, lenderOrgId: string) {
    const template = await prisma.messageTemplate.findFirst({
      where: { id: templateId, lenderOrgId, isSystem: false },
    });

    if (!template) throw ApiError.notFound("Template not found or cannot be deleted");

    await prisma.messageTemplate.delete({ where: { id: templateId } });
    return { success: true };
  }

  private static extractVariables(content: string): string[] {
    const matches = content.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map((m) => m.replace(/[{}]/g, "")))];
  }

  // Broadcasts
  static async getBroadcasts(lenderOrgId: string, query: { page?: number; limit?: number; status?: string } = {}) {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { lenderOrgId };
    if (status) where.status = status;

    const [broadcasts, total] = await Promise.all([
      prisma.broadcast.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.broadcast.count({ where }),
    ]);

    return {
      data: broadcasts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  static async createBroadcast(
    lenderOrgId: string,
    data: {
      subject?: string;
      content: string;
      audience: BroadcastAudience;
      channels: MessageChannel[];
      scheduledAt?: Date;
    },
    userId: string
  ) {
    const status: BroadcastStatus = data.scheduledAt ? "SCHEDULED" : "DRAFT";

    return prisma.broadcast.create({
      data: {
        lenderOrgId,
        subject: data.subject,
        content: data.content,
        audience: data.audience as any,
        channels: data.channels,
        status,
        scheduledAt: data.scheduledAt,
        createdBy: userId,
      },
    });
  }

  static async sendBroadcast(broadcastId: string, lenderOrgId: string, userId: string) {
    const broadcast = await prisma.broadcast.findFirst({
      where: { id: broadcastId, lenderOrgId },
    });

    if (!broadcast) throw ApiError.notFound("Broadcast not found");
    if (broadcast.status === "SENT") throw ApiError.badRequest("Broadcast already sent");

    const audience = broadcast.audience as unknown as BroadcastAudience;
    const recipients = await this.getAudienceRecipients(lenderOrgId, audience);

    await prisma.broadcast.update({
      where: { id: broadcastId },
      data: { status: "SENDING" },
    });

    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      try {
        const personalizedContent = this.personalizeContent(broadcast.content, recipient);

        for (const channel of broadcast.channels) {
          if (channel === "IN_APP") {
            await prisma.notification.create({
              data: {
                userId: recipient.userId,
                title: broadcast.subject || "New Message",
                body: personalizedContent,
                type: "BROADCAST",
                channel: "IN_APP",
              },
            });
          }
        }

        sentCount++;
      } catch (error) {
        failedCount++;
        logger.error("Failed to send broadcast to recipient", { recipientId: recipient.userId, error });
      }
    }

    await prisma.broadcast.update({
      where: { id: broadcastId },
      data: {
        status: "SENT",
        sentAt: new Date(),
        sentCount,
        failedCount,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: "BROADCAST_SENT",
        resource: "BROADCAST",
        resourceId: broadcastId,
        details: { recipientCount: sentCount, failedCount },
      },
    });

    return { sentCount, failedCount, totalRecipients: recipients.length };
  }

  private static async getAudienceRecipients(lenderOrgId: string, audience: BroadcastAudience) {
    let where: any = {
      loans: { some: { program: { lenderOrgId } } },
    };

    switch (audience.type) {
      case "PROGRAM":
        where.loans.some.programId = audience.programId;
        break;
      case "STATE":
        where.state = audience.state;
        break;
      case "COOPERATIVE":
        where.cooperativeId = audience.cooperativeId;
        break;
      case "CUSTOM":
        where.id = { in: audience.borrowerIds };
        break;
    }

    const borrowers = await prisma.borrowerProfile.findMany({
      where,
      select: {
        id: true,
        farmerId: true,
        userId: true,
        user: { select: { firstName: true, lastName: true, phone: true, email: true } },
        loans: {
          where: { status: "ACTIVE" },
          select: { amount: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return borrowers.map((b) => ({
      borrowerId: b.id,
      farmerId: b.farmerId,
      userId: b.userId,
      name: `${b.user.firstName} ${b.user.lastName}`,
      phone: b.user.phone,
      email: b.user.email,
      amount: b.loans[0]?.amount || 0,
    }));
  }

  private static personalizeContent(
    content: string,
    recipient: { name: string; farmerId: string; amount: any }
  ): string {
    return content
      .replace(/\{\{name\}\}/g, recipient.name)
      .replace(/\{\{farmerId\}\}/g, recipient.farmerId)
      .replace(/\{\{amount\}\}/g, Number(recipient.amount).toLocaleString());
  }

  static async getAudienceCount(lenderOrgId: string, audience: BroadcastAudience): Promise<number> {
    const recipients = await this.getAudienceRecipients(lenderOrgId, audience);
    return recipients.length;
  }

  static async markAsRead(conversationId: string, userId: string) {
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true, readAt: new Date() },
    });

    return { success: true };
  }

  static async getUnreadCount(userId: string): Promise<number> {
    return prisma.message.count({
      where: {
        conversation: { participants: { some: { id: userId } } },
        senderId: { not: userId },
        read: false,
      },
    });
  }
}
