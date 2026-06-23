import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";

export class MessageService {
  static async getConversations(userId: string) {
    return prisma.conversation.findMany({
      where: { participants: { some: { id: userId } } },
      include: {
        participants: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
        messages: { take: 1, orderBy: { createdAt: "desc" } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  static async getMessages(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, participants: { some: { id: userId } } },
    });
    if (!conversation) throw ApiError.notFound("Conversation not found");

    return prisma.message.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  static async sendMessage(conversationId: string, senderId: string, content: string) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, participants: { some: { id: senderId } } },
    });
    if (!conversation) throw ApiError.notFound("Conversation not found");

    const message = await prisma.message.create({
      data: { conversationId, senderId, content },
      include: { sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    });

    await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });

    return message;
  }

  static async createConversation(participantIds: string[]) {
    return prisma.conversation.create({
      data: { participants: { connect: participantIds.map(id => ({ id })) } },
      include: { participants: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    });
  }
}
