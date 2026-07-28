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

// Message.seq is a BigInt, which JSON.stringify cannot serialize. Convert it to
// a Number for transport (safe well beyond any per-conversation message count we
// will ever reach). Applied before returning over HTTP or emitting over sockets.
function serializeMessage<T extends { seq?: bigint | null }>(message: T): Omit<T, "seq"> & { seq: number | null } {
  return { ...message, seq: message.seq != null ? Number(message.seq) : null };
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
            orderBy: { seq: "desc" },
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

    // Unread counts in ONE grouped query instead of one COUNT per conversation
    // (the former N+1). Group unread inbound messages across just this page's
    // conversations, then map counts back in memory.
    const conversationIds = conversations.map((c) => c.id);
    const unreadGroups = conversationIds.length
      ? await prisma.message.groupBy({
          by: ["conversationId"],
          where: {
            conversationId: { in: conversationIds },
            senderId: { not: userId },
            read: false,
          },
          _count: { _all: true },
        })
      : [];
    const unreadByConversation = new Map(
      unreadGroups.map((g) => [g.conversationId, g._count._all])
    );

    const conversationsWithUnread = conversations.map((c) => {
      const otherParticipant = c.participants.find((p) => p.id !== userId);
      return {
        ...c,
        unreadCount: unreadByConversation.get(c.id) ?? 0,
        otherParticipant,
        lastMessage: c.messages[0] || null,
      };
    });

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

  static async getMessages(
    conversationId: string,
    userId: string,
    query: { page?: number; limit?: number; beforeSeq?: number } = {}
  ) {
    const { page = 1, limit = 50, beforeSeq } = query;

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, participants: { some: { id: userId } } },
    });
    if (!conversation) throw ApiError.notFound("Conversation not found");

    // Keyset pagination for scroll-up: when a `beforeSeq` cursor is supplied we
    // page by `seq < cursor` instead of OFFSET. OFFSET re-scans and discards all
    // skipped rows, so deep history (page 50+) degrades linearly; keyset stays
    // O(limit) via the (conversationId, seq) index regardless of depth.
    const useKeyset = beforeSeq !== undefined;
    const where = useKeyset
      ? { conversationId, seq: { lt: BigInt(beforeSeq) } }
      : { conversationId };

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true },
          },
        },
        orderBy: { seq: "desc" },
        ...(useKeyset ? {} : { skip: (page - 1) * limit }),
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

    // Returned oldest→newest (ascending seq). `nextCursor` is the lowest seq in
    // this batch; pass it back as `beforeSeq` to fetch the previous page.
    const ordered = messages.reverse().map(serializeMessage);
    const nextCursor = messages.length === limit && ordered.length > 0 ? ordered[0].seq : null;

    return {
      data: ordered,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        nextCursor,
        hasMore: nextCursor !== null,
      },
    };
  }

  static async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    channel: MessageChannel = "IN_APP",
    clientId?: string
  ) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, participants: { some: { id: senderId } } },
    });
    if (!conversation) throw ApiError.notFound("Conversation not found");

    const senderInclude = {
      sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    };

    // Idempotent send: if this client already submitted this clientId for this
    // conversation (retry, double-tap, reconnect replay), return the existing
    // row instead of inserting a duplicate.
    if (clientId) {
      const existing = await prisma.message.findFirst({
        where: { conversationId, clientId },
        include: senderInclude,
      });
      if (existing) {
        logger.info("Duplicate send ignored (clientId match)", { conversationId, clientId });
        return serializeMessage(existing);
      }
    }

    // Assign a per-conversation monotonic seq and create the message atomically.
    // Ordering by seq (not createdAt) is immune to clock skew and same-ms ties.
    // The transaction serializes concurrent sends; the unique (conversationId,
    // clientId) index is the final backstop against duplicates on a race.
    let message;
    try {
      message = await prisma.$transaction(async (tx) => {
        const last = await tx.message.findFirst({
          where: { conversationId },
          orderBy: { seq: "desc" },
          select: { seq: true },
        });
        const nextSeq = (last?.seq ?? 0n) + 1n;

        const created = await tx.message.create({
          data: {
            conversationId,
            senderId,
            content,
            channel,
            status: "SENT",
            seq: nextSeq,
            clientId,
          },
          include: senderInclude,
        });

        await tx.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });

        return created;
      });
    } catch (err: any) {
      // Unique-constraint race on (conversationId, clientId): another concurrent
      // request inserted the same clientId first — return that row.
      if (err?.code === "P2002" && clientId) {
        const existing = await prisma.message.findFirst({
          where: { conversationId, clientId },
          include: senderInclude,
        });
        if (existing) return serializeMessage(existing);
      }
      throw err;
    }

    logger.info("Message sent", { conversationId, senderId, channel, seq: String(message.seq) });

    emitToConversation(conversationId, "message:new", serializeMessage(message));

    return serializeMessage(message);
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

  // ── Phase 3: delivery guarantees & receipts ────────────────────────────────

  /**
   * Mark a message DELIVERED (recipient's client acknowledged receipt). Only
   * advances SENT → DELIVERED, and only for a message the acking user did not
   * send and is a participant of. Returns the conversationId on a real
   * transition so the caller can notify the sender, or null otherwise.
   */
  static async markDelivered(messageId: string, userId: string): Promise<string | null> {
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: { not: userId },
        status: "SENT",
        conversation: { participants: { some: { id: userId } } },
      },
      select: { id: true, conversationId: true },
    });
    if (!message) return null;

    await prisma.message.update({
      where: { id: message.id },
      data: { status: "DELIVERED", deliveredAt: new Date() },
    });
    return message.conversationId;
  }

  /**
   * Mark every inbound message in a conversation as read for this user, and
   * return the ids that transitioned plus the conversationId — so the caller
   * can push a live read receipt to the senders. Authorization: the user must
   * be a participant.
   */
  static async markConversationRead(
    conversationId: string,
    userId: string
  ): Promise<{ conversationId: string; messageIds: string[] } | null> {
    const convo = await prisma.conversation.findFirst({
      where: { id: conversationId, participants: { some: { id: userId } } },
      select: { id: true },
    });
    if (!convo) return null;

    const unread = await prisma.message.findMany({
      where: { conversationId, senderId: { not: userId }, read: false },
      select: { id: true },
    });

    if (unread.length > 0) {
      await prisma.message.updateMany({
        where: { conversationId, senderId: { not: userId }, read: false },
        data: { read: true, readAt: new Date(), status: "READ" },
      });
    }

    return { conversationId, messageIds: unread.map((m) => m.id) };
  }

  /**
   * Reconnect catch-up: stream messages newer than the client's last known seq
   * for a conversation. Deterministically closes the "socket was down at emit
   * time" gap without relying on the poll interval. Participant-guarded.
   */
  static async getMessagesSince(conversationId: string, userId: string, sinceSeq: number) {
    const convo = await prisma.conversation.findFirst({
      where: { id: conversationId, participants: { some: { id: userId } } },
      select: { id: true },
    });
    if (!convo) throw ApiError.notFound("Conversation not found");

    const messages = await prisma.message.findMany({
      where: { conversationId, seq: { gt: BigInt(sinceSeq) } },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
      },
      orderBy: { seq: "asc" },
      take: 200,
    });

    return messages.map(serializeMessage);
  }

  /**
   * Retention cleanup: delete messages older than `retentionDays`. Returns the
   * number of rows removed. Called by a scheduled job; only runs when a
   * retention window is configured (see MESSAGE_RETENTION_DAYS). At our volume
   * this is optional — kept simple (bulk delete by createdAt), not sharding.
   */
  static async purgeOldMessages(retentionDays: number): Promise<number> {
    if (!retentionDays || retentionDays <= 0) return 0;
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const { count } = await prisma.message.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    if (count > 0) {
      logger.info("Message retention purge complete", { retentionDays, deleted: count });
    }
    return count;
  }
}
