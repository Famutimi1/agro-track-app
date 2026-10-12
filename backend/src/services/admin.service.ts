import crypto from "crypto";
import { prisma } from "../config/prisma";
import { getPagination, paginatedResponse, PaginationQuery } from "../utils/pagination";
import { ApiError } from "../utils/api-error";
import { ApiKeyService } from "./apikey.service";
import { env } from "../config/env";
import { redis, redisEnabled, redisAvailable } from "../config/redis";
import { Role, TicketStatus, LenderStatus, LenderPlan, VerificationStatus, MessageChannel } from "@prisma/client";

const ASSIGNABLE_ROLES: Role[] = [
  "SUPER_ADMIN",
  "LENDER_ADMIN",
  "LENDER_MANAGER",
  "LENDER_VIEWER",
  "LENDER_ANALYST",
  "BORROWER",
  "FIELD_AGENT",
  "FIELD_SUPERVISOR",
  "COOP_CHAIR",
];

// Monthly subscription price (NGN) per lender plan tier. Drives MRR/ARR and
// invoice amounts. Adjust here when pricing changes.
const PLAN_PRICING: Record<LenderPlan, number> = {
  STARTER: 50000,
  GROWTH: 150000,
  ENTERPRISE: 500000,
};

export class AdminService {
  static async getPlatformStats() {
    const [totalUsers, totalLenders, totalBorrowers, totalLoans, totalDisbursed, totalRepaid] = await Promise.all([
      prisma.user.count(),
      prisma.lenderOrganization.count(),
      prisma.borrowerProfile.count(),
      prisma.borrowerLoan.count(),
      prisma.disbursement.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
      prisma.repayment.aggregate({ where: { status: "PAID" }, _sum: { paidAmount: true } }),
    ]);

    return {
      totalUsers,
      totalLenders,
      totalBorrowers,
      totalLoans,
      totalDisbursed: totalDisbursed._sum.amount || 0,
      totalRepaid: totalRepaid._sum.paidAmount || 0,
    };
  }

  static async getLenderAccounts(query: PaginationQuery & { search?: string; plan?: string; status?: string }) {
    const { page, limit, skip } = getPagination(query);
    const where: any = {};
    if (query.search) where.name = { contains: query.search, mode: "insensitive" };
    if (query.plan) where.plan = query.plan;
    if (query.status) where.status = query.status;

    const [lenders, total] = await Promise.all([
      prisma.lenderOrganization.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        include: { _count: { select: { programs: true, users: true } } },
      }),
      prisma.lenderOrganization.count({ where }),
    ]);

    return paginatedResponse(lenders, total, page, limit);
  }

  static async getTickets(query: PaginationQuery & { status?: string; priority?: string }) {
    const { page, limit, skip } = getPagination(query);
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return paginatedResponse(tickets, total, page, limit);
  }

  static async getFeatureFlags() {
    return prisma.featureFlag.findMany({ orderBy: { key: "asc" } });
  }

  static async toggleFeatureFlag(
    id: string,
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    const flag = await prisma.featureFlag.findUnique({ where: { id } });
    if (!flag) return null;

    const newValue = !flag.enabled;
    const updated = await prisma.featureFlag.update({
      where: { id },
      data: { enabled: newValue },
    });

    // Audit-log every feature-flag toggle (parity with all other mutations).
    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: "FEATURE_FLAG_TOGGLED",
        resource: "FeatureFlag",
        resourceId: id,
        details: { key: flag.key, enabled: newValue },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    return updated;
  }

  static async getAuditLog(query: PaginationQuery & { action?: string; resource?: string }) {
    const { page, limit, skip } = getPagination(query);
    const where: any = {};
    if (query.action) where.action = query.action;
    if (query.resource) where.resource = query.resource;
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        include: { user: { select: { firstName: true, lastName: true, email: true, role: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);
    return paginatedResponse(logs, total, page, limit);
  }

  static async getUsers(query: PaginationQuery & { search?: string; role?: string; isActive?: boolean }) {
    const { page, limit, skip } = getPagination(query);
    const where: any = {};
    if (query.role) where.role = query.role;
    if (typeof query.isActive === "boolean") where.isActive = query.isActive;
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: "insensitive" } },
        { lastName: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        select: {
          id: true, firstName: true, lastName: true, email: true, role: true,
          isActive: true, emailVerified: true, lastLoginAt: true, createdAt: true,
          lenderOrg: { select: { id: true, name: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return paginatedResponse(users, total, page, limit);
  }

  static async changeUserRole(
    targetUserId: string,
    newRole: string,
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    if (!ASSIGNABLE_ROLES.includes(newRole as Role)) {
      throw ApiError.badRequest(`Invalid role: ${newRole}`);
    }

    const target = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target) throw ApiError.notFound("User not found");

    const nextRole = newRole as Role;

    // No-op if the role is unchanged.
    if (target.role === nextRole) {
      throw ApiError.badRequest("User already has this role");
    }

    // Prevent a super admin from demoting themselves — they would lock
    // themselves out of the admin console mid-session.
    if (target.id === actor.id && target.role === "SUPER_ADMIN" && nextRole !== "SUPER_ADMIN") {
      throw ApiError.badRequest("You cannot change your own super admin role");
    }

    // Prevent demoting the last remaining super admin — the platform must
    // always retain at least one.
    if (target.role === "SUPER_ADMIN" && nextRole !== "SUPER_ADMIN") {
      const superAdminCount = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
      if (superAdminCount <= 1) {
        throw ApiError.badRequest("Cannot demote the last remaining super admin");
      }
    }

    const previousRole = target.role;

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: nextRole },
      select: {
        id: true, firstName: true, lastName: true, email: true, role: true,
        isActive: true, emailVerified: true, lastLoginAt: true, createdAt: true,
      },
    });

    // Audit-log every role change.
    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: "USER_ROLE_CHANGED",
        resource: "User",
        resourceId: targetUserId,
        details: {
          targetUserId,
          targetEmail: target.email,
          previousRole,
          newRole: nextRole,
        },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    return updated;
  }

  static async setUserStatus(
    targetUserId: string,
    isActive: boolean,
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    const target = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target) throw ApiError.notFound("User not found");

    if (target.isActive === isActive) {
      throw ApiError.badRequest(
        isActive ? "User is already active" : "User is already deactivated"
      );
    }

    // Prevent an admin from deactivating themselves — they would lock
    // themselves out mid-session.
    if (target.id === actor.id && !isActive) {
      throw ApiError.badRequest("You cannot deactivate your own account");
    }

    // Prevent deactivating the last remaining active super admin — the
    // platform must always retain at least one who can sign in.
    if (target.role === "SUPER_ADMIN" && !isActive) {
      const activeSuperAdmins = await prisma.user.count({
        where: { role: "SUPER_ADMIN", isActive: true },
      });
      if (activeSuperAdmins <= 1) {
        throw ApiError.badRequest("Cannot deactivate the last remaining super admin");
      }
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { isActive },
      select: {
        id: true, firstName: true, lastName: true, email: true, role: true,
        isActive: true, emailVerified: true, lastLoginAt: true, createdAt: true,
        lenderOrg: { select: { id: true, name: true } },
      },
    });

    // Audit-log every status change.
    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
        resource: "User",
        resourceId: targetUserId,
        details: {
          targetUserId,
          targetEmail: target.email,
          isActive,
        },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    return updated;
  }

  static async getTicket(ticketId: string) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { firstName: true, lastName: true, role: true } },
          },
        },
      },
    });
    if (!ticket) throw ApiError.notFound("Ticket not found");
    return ticket;
  }

  static async replyTicket(
    ticketId: string,
    body: string,
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    const trimmed = (body || "").trim();
    if (!trimmed) throw ApiError.badRequest("Reply body is required");

    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw ApiError.notFound("Ticket not found");

    await prisma.ticketMessage.create({
      data: { ticketId, authorId: actor.id, body: trimmed, isStaff: true },
    });

    // An admin reply moves an untouched ticket into active handling.
    if (ticket.status === "OPEN") {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: "IN_PROGRESS" },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: "SUPPORT_TICKET_REPLIED",
        resource: "SupportTicket",
        resourceId: ticketId,
        details: { subject: ticket.subject },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    return this.getTicket(ticketId);
  }

  static async updateTicket(
    ticketId: string,
    patch: { status?: string },
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    if (!patch.status) throw ApiError.badRequest("status is required");
    if (!Object.values(TicketStatus).includes(patch.status as TicketStatus)) {
      throw ApiError.badRequest(`Invalid status: ${patch.status}`);
    }

    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw ApiError.notFound("Ticket not found");

    const nextStatus = patch.status as TicketStatus;
    if (ticket.status === nextStatus) {
      throw ApiError.badRequest("Ticket already has this status");
    }

    // A ticket is considered resolved once it reaches RESOLVED or CLOSED;
    // moving it back to an open state clears the resolution timestamp.
    const isResolvedState = nextStatus === "RESOLVED" || nextStatus === "CLOSED";
    const previousStatus = ticket.status;

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: nextStatus,
        resolvedAt: isResolvedState ? new Date() : null,
      },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });

    // Audit-log every ticket status change.
    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: "SUPPORT_TICKET_UPDATED",
        resource: "SupportTicket",
        resourceId: ticketId,
        details: { subject: ticket.subject, previousStatus, newStatus: nextStatus },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    return updated;
  }

  static async setLenderStatus(
    lenderId: string,
    status: string,
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    if (!Object.values(LenderStatus).includes(status as LenderStatus)) {
      throw ApiError.badRequest(`Invalid status: ${status}`);
    }

    const lender = await prisma.lenderOrganization.findUnique({ where: { id: lenderId } });
    if (!lender) throw ApiError.notFound("Lender not found");

    const nextStatus = status as LenderStatus;
    if (lender.status === nextStatus) {
      throw ApiError.badRequest("Lender already has this status");
    }

    const previousStatus = lender.status;

    const updated = await prisma.lenderOrganization.update({
      where: { id: lenderId },
      data: {
        status: nextStatus,
        // Activating an org implies it has been verified.
        ...(nextStatus === "ACTIVE" ? { verified: true } : {}),
      },
      include: { _count: { select: { programs: true, users: true } } },
    });

    // Audit-log every lender status change.
    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: "LENDER_STATUS_CHANGED",
        resource: "LenderOrganization",
        resourceId: lenderId,
        details: { name: lender.name, previousStatus, newStatus: nextStatus },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    return updated;
  }

  static async changeLenderPlan(
    lenderId: string,
    plan: string,
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    if (!Object.values(LenderPlan).includes(plan as LenderPlan)) {
      throw ApiError.badRequest(`Invalid plan: ${plan}`);
    }

    const lender = await prisma.lenderOrganization.findUnique({ where: { id: lenderId } });
    if (!lender) throw ApiError.notFound("Lender not found");

    const nextPlan = plan as LenderPlan;
    if (lender.plan === nextPlan) {
      throw ApiError.badRequest("Lender already has this plan");
    }

    const previousPlan = lender.plan;

    const updated = await prisma.lenderOrganization.update({
      where: { id: lenderId },
      data: { plan: nextPlan },
      include: { _count: { select: { programs: true, users: true } } },
    });

    // Audit-log every lender plan change.
    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: "LENDER_PLAN_CHANGED",
        resource: "LenderOrganization",
        resourceId: lenderId,
        details: { name: lender.name, previousPlan, newPlan: nextPlan },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    return updated;
  }

  static async getDocuments(
    query: PaginationQuery & { status?: string; type?: string }
  ) {
    const { page, limit, skip } = getPagination(query);
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          borrower: {
            select: {
              farmerId: true,
              user: { select: { firstName: true, lastName: true, email: true } },
            },
          },
        },
      }),
      prisma.document.count({ where }),
    ]);

    return paginatedResponse(documents, total, page, limit);
  }

  static async verifyDocument(
    documentId: string,
    decision: "APPROVED" | "REJECTED",
    reason: string | undefined,
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    const doc = await prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw ApiError.notFound("Document not found");

    if (decision !== "APPROVED" && decision !== "REJECTED") {
      throw ApiError.badRequest("decision must be APPROVED or REJECTED");
    }
    if (decision === "REJECTED" && !(reason || "").trim()) {
      throw ApiError.badRequest("A rejection reason is required");
    }

    // Map the admin decision onto the platform's verification status enum.
    const nextStatus: VerificationStatus =
      decision === "APPROVED" ? "VERIFIED" : "FAILED";

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: nextStatus,
        verifiedBy: actor.id,
        verifiedAt: new Date(),
        rejectionReason: decision === "REJECTED" ? reason!.trim() : null,
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        borrower: {
          select: {
            farmerId: true,
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: decision === "APPROVED" ? "DOCUMENT_VERIFIED" : "DOCUMENT_REJECTED",
        resource: "Document",
        resourceId: documentId,
        details: {
          type: doc.type,
          fileName: doc.fileName,
          decision,
          ...(decision === "REJECTED" ? { reason: reason!.trim() } : {}),
        },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    return updated;
  }

  // ─── Platform announcements (broadcasts) ──────────────────────────────────
  // Platform-level records carry lenderOrgId = null. Audience is stored as JSON:
  //   { type: "ALL" } | { type: "ROLE", roles: Role[] }

  private static resolveAnnouncementRoles(audience: any): Role[] | null {
    if (!audience || audience.type === "ALL") return null; // null = every user
    if (audience.type === "ROLE" && Array.isArray(audience.roles) && audience.roles.length) {
      return audience.roles as Role[];
    }
    return null;
  }

  static async getBroadcasts(query: PaginationQuery & { status?: string }) {
    const { page, limit, skip } = getPagination(query);
    const where: any = { lenderOrgId: null };
    if (query.status) where.status = query.status;

    const [broadcasts, total] = await Promise.all([
      prisma.broadcast.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.broadcast.count({ where }),
    ]);

    return paginatedResponse(broadcasts, total, page, limit);
  }

  static async createBroadcast(
    data: {
      subject?: string;
      content: string;
      audience: any;
      channels: MessageChannel[];
    },
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    if (!data.content?.trim()) throw ApiError.badRequest("Content is required");
    const channels = data.channels?.length ? data.channels : (["IN_APP"] as MessageChannel[]);

    const broadcast = await prisma.broadcast.create({
      data: {
        lenderOrgId: null,
        subject: data.subject?.trim() || null,
        content: data.content.trim(),
        audience: (data.audience ?? { type: "ALL" }) as any,
        channels,
        status: "DRAFT",
        createdBy: actor.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: "BROADCAST_CREATED",
        resource: "Broadcast",
        resourceId: broadcast.id,
        details: { subject: broadcast.subject, audience: data.audience ?? { type: "ALL" } },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    return broadcast;
  }

  static async sendBroadcast(
    broadcastId: string,
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    const broadcast = await prisma.broadcast.findFirst({
      where: { id: broadcastId, lenderOrgId: null },
    });
    if (!broadcast) throw ApiError.notFound("Announcement not found");
    if (broadcast.status === "SENT") throw ApiError.badRequest("Announcement already sent");

    const roles = this.resolveAnnouncementRoles(broadcast.audience);
    const recipients = await prisma.user.findMany({
      where: { isActive: true, ...(roles ? { role: { in: roles } } : {}) },
      select: { id: true },
    });

    await prisma.broadcast.update({
      where: { id: broadcastId },
      data: { status: "SENDING" },
    });

    let sentCount = 0;
    let failedCount = 0;

    // In-app notification fan-out. Other channels (SMS/email) are recorded as
    // requested but not yet delivered by a provider — see chat-hardening plan.
    if (broadcast.channels.includes("IN_APP")) {
      try {
        const result = await prisma.notification.createMany({
          data: recipients.map((r) => ({
            userId: r.id,
            title: broadcast.subject || "Platform Announcement",
            body: broadcast.content,
            type: "BROADCAST" as const,
            channel: "IN_APP" as const,
          })),
        });
        sentCount = result.count;
      } catch {
        failedCount = recipients.length;
      }
    } else {
      sentCount = recipients.length;
    }

    const updated = await prisma.broadcast.update({
      where: { id: broadcastId },
      data: { status: "SENT", sentAt: new Date(), sentCount, failedCount },
    });

    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: "BROADCAST_SENT",
        resource: "Broadcast",
        resourceId: broadcastId,
        details: { recipientCount: sentCount, failedCount },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    return updated;
  }

  static async deleteBroadcast(
    broadcastId: string,
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    const broadcast = await prisma.broadcast.findFirst({
      where: { id: broadcastId, lenderOrgId: null },
    });
    if (!broadcast) throw ApiError.notFound("Announcement not found");
    if (broadcast.status === "SENT" || broadcast.status === "SENDING") {
      throw ApiError.badRequest("Sent announcements cannot be deleted");
    }

    await prisma.broadcast.delete({ where: { id: broadcastId } });

    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: "BROADCAST_DELETED",
        resource: "Broadcast",
        resourceId: broadcastId,
        details: { subject: broadcast.subject },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    return { id: broadcastId };
  }

  static async getTemplates() {
    return prisma.messageTemplate.findMany({
      where: { lenderOrgId: null },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createTemplate(
    data: { name: string; category: string; content: string; channels?: MessageChannel[] },
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    if (!data.name?.trim()) throw ApiError.badRequest("Name is required");
    if (!data.content?.trim()) throw ApiError.badRequest("Content is required");

    // Extract {{variable}} tokens so they can be surfaced in the UI later.
    const variables = Array.from(
      new Set([...data.content.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]))
    );

    const template = await prisma.messageTemplate.create({
      data: {
        lenderOrgId: null,
        name: data.name.trim(),
        category: data.category?.trim() || "General",
        content: data.content.trim(),
        channels: data.channels?.length ? data.channels : (["IN_APP"] as MessageChannel[]),
        variables,
        createdBy: actor.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: "MESSAGE_TEMPLATE_CREATED",
        resource: "MessageTemplate",
        resourceId: template.id,
        details: { name: template.name, category: template.category },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    return template;
  }

  static async deleteTemplate(
    templateId: string,
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    const template = await prisma.messageTemplate.findFirst({
      where: { id: templateId, lenderOrgId: null },
    });
    if (!template) throw ApiError.notFound("Template not found");

    await prisma.messageTemplate.delete({ where: { id: templateId } });

    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: "MESSAGE_TEMPLATE_DELETED",
        resource: "MessageTemplate",
        resourceId: templateId,
        details: { name: template.name },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    return { id: templateId };
  }

  // ─── Platform integrations: webhooks ──────────────────────────────────────
  // Platform-level webhooks carry lenderOrgId = null.

  static async getWebhooks() {
    return prisma.webhook.findMany({
      where: { lenderOrgId: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        url: true,
        events: true,
        active: true,
        lastTriggered: true,
        failCount: true,
        createdAt: true,
      },
    });
  }

  static async createWebhook(
    data: { url: string; events: string[] },
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    if (!data.url?.trim()) throw ApiError.badRequest("URL is required");
    try {
      // Basic URL validation.
      new URL(data.url);
    } catch {
      throw ApiError.badRequest("A valid URL is required");
    }
    if (!Array.isArray(data.events) || data.events.length === 0) {
      throw ApiError.badRequest("At least one event is required");
    }

    const secret = `whsec_${crypto.randomBytes(24).toString("hex")}`;

    const webhook = await prisma.webhook.create({
      data: {
        lenderOrgId: null,
        url: data.url.trim(),
        secret,
        events: data.events,
        active: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: "WEBHOOK_CREATED",
        resource: "Webhook",
        resourceId: webhook.id,
        details: { url: webhook.url, events: webhook.events },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    // Secret is returned in full on creation; subsequent reads redact it.
    return webhook;
  }

  static async toggleWebhook(
    webhookId: string,
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    const webhook = await prisma.webhook.findFirst({
      where: { id: webhookId, lenderOrgId: null },
    });
    if (!webhook) throw ApiError.notFound("Webhook not found");

    const updated = await prisma.webhook.update({
      where: { id: webhookId },
      data: { active: !webhook.active },
    });

    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: "WEBHOOK_TOGGLED",
        resource: "Webhook",
        resourceId: webhookId,
        details: { url: webhook.url, active: updated.active },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    return updated;
  }

  static async deleteWebhook(
    webhookId: string,
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    const webhook = await prisma.webhook.findFirst({
      where: { id: webhookId, lenderOrgId: null },
    });
    if (!webhook) throw ApiError.notFound("Webhook not found");

    await prisma.webhook.delete({ where: { id: webhookId } });

    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: "WEBHOOK_DELETED",
        resource: "Webhook",
        resourceId: webhookId,
        details: { url: webhook.url },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    return { id: webhookId };
  }

  // ─── Platform integrations: API keys ──────────────────────────────────────
  // Keys are scoped to the acting admin's own userId (ApiKey is user-scoped).

  static async getApiKeys(actorId: string) {
    return ApiKeyService.list(actorId);
  }

  static async createApiKey(
    data: { name: string; permissions?: string[] },
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    if (!data.name?.trim()) throw ApiError.badRequest("Name is required");

    const created = await ApiKeyService.create(actor.id, {
      name: data.name.trim(),
      permissions: data.permissions ?? ["read"],
    });

    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: "API_KEY_CREATED",
        resource: "ApiKey",
        resourceId: created.id,
        details: { name: created.name, permissions: created.permissions },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    // Full plaintext key present here only — surfaced once to the caller.
    return created;
  }

  static async revokeApiKey(
    keyId: string,
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    await ApiKeyService.revoke(actor.id, keyId);

    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: "API_KEY_REVOKED",
        resource: "ApiKey",
        resourceId: keyId,
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    return { id: keyId };
  }

  static async getTransactions(
    query: PaginationQuery & { type?: string; status?: string; search?: string }
  ) {
    const { page, limit, skip } = getPagination(query);
    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { reference: { contains: query.search, mode: "insensitive" } },
        { providerRef: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [transactions, total, statusGroups] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.transaction.count({ where }),
      // Volume summary is computed over the full (filtered) set, not just the page.
      prisma.transaction.groupBy({
        by: ["status"],
        where,
        _sum: { amount: true },
        _count: { _all: true },
      }),
    ]);

    const summary = statusGroups.reduce(
      (acc, g) => {
        acc[g.status] = {
          count: g._count._all,
          amount: Number(g._sum.amount ?? 0),
        };
        return acc;
      },
      {} as Record<string, { count: number; amount: number }>
    );

    return { ...paginatedResponse(transactions, total, page, limit), summary };
  }

  static async getGrowthAnalytics(query: { months?: string }) {
    const months = Math.min(24, Math.max(1, parseInt(query.months || "6", 10)));

    const now = new Date();
    // Build the list of month buckets, oldest first.
    const buckets: { label: string; start: Date; end: Date }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      buckets.push({
        label: start.toLocaleString("en-US", { month: "short" }),
        start,
        end,
      });
    }

    const earliest = buckets[0].start;

    const [lenders, borrowers, loans, disbursements] = await Promise.all([
      prisma.lenderOrganization.findMany({
        where: { createdAt: { gte: earliest } },
        select: { createdAt: true },
      }),
      prisma.borrowerProfile.findMany({
        where: { createdAt: { gte: earliest } },
        select: { createdAt: true },
      }),
      prisma.borrowerLoan.findMany({
        where: { createdAt: { gte: earliest } },
        select: { createdAt: true },
      }),
      prisma.disbursement.findMany({
        where: { status: "COMPLETED", createdAt: { gte: earliest } },
        select: { createdAt: true, amount: true },
      }),
    ]);

    // Cumulative baselines: totals that existed BEFORE the earliest bucket.
    const [lenderBase, borrowerBase] = await Promise.all([
      prisma.lenderOrganization.count({ where: { createdAt: { lt: earliest } } }),
      prisma.borrowerProfile.count({ where: { createdAt: { lt: earliest } } }),
    ]);

    let lenderRunning = lenderBase;
    let borrowerRunning = borrowerBase;

    const data = buckets.map((b) => {
      const inBucket = (d: Date) => d >= b.start && d < b.end;
      lenderRunning += lenders.filter((l) => inBucket(l.createdAt)).length;
      borrowerRunning += borrowers.filter((x) => inBucket(x.createdAt)).length;
      const loansInMonth = loans.filter((l) => inBucket(l.createdAt)).length;
      const revenueInMonth = disbursements
        .filter((x) => inBucket(x.createdAt))
        .reduce((sum, x) => sum + Number(x.amount || 0), 0);

      return {
        m: b.label,
        lenders: lenderRunning,
        farmers: borrowerRunning,
        loans: loansInMonth,
        revenue: revenueInMonth,
      };
    });

    return data;
  }

  static async getRevenueStats() {
    // MRR is the sum of the monthly amount across all active subscriptions;
    // ARR is MRR annualised. The revenue breakdown and plan distribution are
    // derived from real subscription rows grouped by plan tier.
    const [activeSubs, paidAgg, disbursedAgg] = await Promise.all([
      prisma.subscription.findMany({
        where: { status: "ACTIVE" },
        select: { plan: true, amount: true },
      }),
      prisma.payment.aggregate({ _sum: { amount: true } }),
      prisma.disbursement.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
    ]);

    const totalCollected = Number(paidAgg._sum.amount || 0);
    const totalDisbursed = Number(disbursedAgg._sum.amount || 0);

    // Aggregate MRR and subscriber count per plan tier in a single pass.
    const perPlan: Record<string, { mrr: number; count: number }> = {};
    let mrr = 0;
    for (const sub of activeSubs) {
      const amount = Number(sub.amount || 0);
      mrr += amount;
      const key = sub.plan || "UNKNOWN";
      if (!perPlan[key]) perPlan[key] = { mrr: 0, count: 0 };
      perPlan[key].mrr += amount;
      perPlan[key].count += 1;
    }

    // Plan distribution — how many active subscriptions sit on each tier.
    const planDistribution = Object.entries(perPlan).map(([name, v]) => ({
      name,
      value: v.count,
    }));

    // Revenue breakdown — monthly recurring revenue contributed by each tier.
    const breakdown = Object.entries(perPlan).map(([name, v]) => ({
      name,
      value: v.mrr,
    }));

    return {
      mrr,
      arr: mrr * 12,
      totalCollected,
      totalDisbursed,
      breakdown,
      planDistribution,
    };
  }

  // ── Subscriptions ──────────────────────────────────────────────────────

  static async getSubscriptions(
    query: PaginationQuery & { status?: string; plan?: string }
  ) {
    const { page, limit, skip } = getPagination(query);
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.plan) where.plan = query.plan;

    const [rows, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          lenderOrg: { select: { id: true, name: true } },
        },
      }),
      prisma.subscription.count({ where }),
    ]);

    const data = rows.map((s) => ({
      id: s.id,
      lenderOrgId: s.lenderOrgId,
      lenderName: s.lenderOrg?.name ?? "—",
      plan: s.plan,
      status: s.status,
      amount: Number(s.amount),
      currency: s.currency,
      currentPeriodStart: s.currentPeriodStart.toISOString(),
      currentPeriodEnd: s.currentPeriodEnd.toISOString(),
      canceledAt: s.canceledAt ? s.canceledAt.toISOString() : null,
      createdAt: s.createdAt.toISOString(),
    }));

    return paginatedResponse(data, total, page, limit);
  }

  /**
   * Backfill one ACTIVE subscription per lender org that doesn't already have
   * one, pricing it from PLAN_PRICING. Idempotent — safe to run repeatedly.
   */
  static async seedSubscriptions(actor: {
    id: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const lenders = await prisma.lenderOrganization.findMany({
      select: { id: true, plan: true, subscriptions: { select: { id: true } } },
    });

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    let created = 0;
    for (const l of lenders) {
      if (l.subscriptions.length > 0) continue;
      const amount = PLAN_PRICING[l.plan as LenderPlan] ?? 0;
      await prisma.subscription.create({
        data: {
          lenderOrgId: l.id,
          plan: l.plan,
          status: "ACTIVE",
          amount,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });
      created += 1;
    }

    if (created > 0) {
      await prisma.auditLog.create({
        data: {
          userId: actor.id,
          action: "SUBSCRIPTIONS_SEEDED",
          resource: "Subscription",
          details: { created },
          ipAddress: actor.ipAddress,
          userAgent: actor.userAgent,
        },
      });
    }

    return { created };
  }

  // ── Invoices ───────────────────────────────────────────────────────────

  static async getInvoices(
    query: PaginationQuery & { status?: string; lenderOrgId?: string }
  ) {
    const { page, limit, skip } = getPagination(query);
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.lenderOrgId) where.lenderOrgId = query.lenderOrgId;

    const [rows, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { issuedAt: "desc" },
        include: {
          lenderOrg: { select: { id: true, name: true } },
          _count: { select: { payments: true } },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    const data = rows.map((inv) => ({
      id: inv.id,
      number: inv.number,
      lenderOrgId: inv.lenderOrgId,
      lenderName: inv.lenderOrg?.name ?? "—",
      amount: Number(inv.amount),
      currency: inv.currency,
      status: inv.status,
      issuedAt: inv.issuedAt.toISOString(),
      dueAt: inv.dueAt.toISOString(),
      paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
      paymentCount: inv._count.payments,
    }));

    return paginatedResponse(data, total, page, limit);
  }

  static async getInvoice(id: string) {
    const inv = await prisma.invoice.findUnique({
      where: { id },
      include: {
        lenderOrg: { select: { id: true, name: true } },
        payments: { orderBy: { paidAt: "desc" } },
      },
    });
    if (!inv) throw new ApiError(404, "Invoice not found");

    return {
      id: inv.id,
      number: inv.number,
      lenderOrgId: inv.lenderOrgId,
      lenderName: inv.lenderOrg?.name ?? "—",
      subscriptionId: inv.subscriptionId,
      amount: Number(inv.amount),
      currency: inv.currency,
      status: inv.status,
      lineItems: inv.lineItems,
      issuedAt: inv.issuedAt.toISOString(),
      dueAt: inv.dueAt.toISOString(),
      paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
      createdAt: inv.createdAt.toISOString(),
      payments: inv.payments.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        currency: p.currency,
        method: p.method,
        reference: p.reference,
        paidAt: p.paidAt.toISOString(),
      })),
    };
  }

  /**
   * Generate one OPEN invoice per active subscription for the current period.
   * Skips subscriptions that already have an invoice issued in the last 25
   * days to avoid double-billing when run manually. Returns the count created.
   */
  static async generateInvoices(actor: {
    id: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const subs = await prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      include: { lenderOrg: { select: { name: true } } },
    });

    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 25);
    const dueAt = new Date(now);
    dueAt.setDate(dueAt.getDate() + 14);

    let created = 0;
    for (const sub of subs) {
      const recent = await prisma.invoice.findFirst({
        where: { subscriptionId: sub.id, issuedAt: { gte: cutoff } },
        select: { id: true },
      });
      if (recent) continue;

      const amount = Number(sub.amount);
      const number = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

      await prisma.invoice.create({
        data: {
          number,
          lenderOrgId: sub.lenderOrgId,
          subscriptionId: sub.id,
          amount,
          currency: sub.currency,
          status: "OPEN",
          lineItems: [
            {
              description: `${sub.plan} plan — monthly subscription`,
              amount,
              quantity: 1,
            },
          ],
          issuedAt: now,
          dueAt,
        },
      });
      created += 1;
    }

    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: "INVOICES_GENERATED",
        resource: "Invoice",
        details: { created },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    return { created };
  }

  static async recordPayment(
    invoiceId: string,
    input: { amount: number; method: string; reference?: string },
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new ApiError(404, "Invoice not found");
    if (invoice.status === "VOID")
      throw new ApiError(400, "Cannot record a payment on a void invoice");
    if (invoice.status === "PAID")
      throw new ApiError(400, "Invoice is already paid");

    const amount = Number(input.amount);
    if (!amount || amount <= 0)
      throw new ApiError(400, "Payment amount must be greater than zero");

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          invoiceId,
          amount,
          currency: invoice.currency,
          method: input.method,
          reference: input.reference,
        },
      });

      // Sum all payments to decide whether the invoice is fully settled.
      const paidAgg = await tx.payment.aggregate({
        where: { invoiceId },
        _sum: { amount: true },
      });
      const totalPaid = Number(paidAgg._sum.amount || 0);
      const fullySettled = totalPaid >= Number(invoice.amount);

      const updated = await tx.invoice.update({
        where: { id: invoiceId },
        data: fullySettled
          ? { status: "PAID", paidAt: new Date() }
          : {},
      });

      return { payment, updated, totalPaid, fullySettled };
    });

    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: "INVOICE_PAYMENT_RECORDED",
        resource: "Invoice",
        resourceId: invoiceId,
        details: {
          amount,
          method: input.method,
          fullySettled: result.fullySettled,
        },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    return this.getInvoice(invoiceId);
  }

  static async voidInvoice(
    invoiceId: string,
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new ApiError(404, "Invoice not found");
    if (invoice.status === "PAID")
      throw new ApiError(400, "Cannot void a paid invoice");
    if (invoice.status === "VOID") return this.getInvoice(invoiceId);

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "VOID" },
    });

    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: "INVOICE_VOIDED",
        resource: "Invoice",
        resourceId: invoiceId,
        details: { number: invoice.number },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    return this.getInvoice(invoiceId);
  }

  static async getSystemHealth() {
    // Probe the primary dependencies we can actually reach from the API
    // process. Each probe reports its real state with a measured latency where
    // possible. Services that aren't wired up report "Not Configured" rather
    // than a fabricated "Operational".
    type ServiceStatus =
      | "Operational"
      | "Degraded"
      | "Down"
      | "Not Configured";
    const services: {
      name: string;
      status: ServiceStatus;
      latency: string;
      detail?: string;
    }[] = [];

    // Database probe — round-trip a trivial query and measure latency.
    const dbStart = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      const ms = Date.now() - dbStart;
      services.push({
        name: "Database",
        status: ms < 500 ? "Operational" : "Degraded",
        latency: `${ms}ms`,
      });
    } catch (err) {
      services.push({
        name: "Database",
        status: "Down",
        latency: "—",
        detail: (err as Error).message,
      });
    }

    // Cache / Redis probe — only meaningful when Redis is enabled. When it's
    // disabled the app runs on an in-memory store, which we report honestly.
    if (!redisEnabled) {
      services.push({
        name: "Cache (Redis)",
        status: "Not Configured",
        latency: "—",
        detail: "REDIS_ENABLED=false — using in-memory store",
      });
    } else {
      const cacheStart = Date.now();
      try {
        await redis.ping();
        const ms = Date.now() - cacheStart;
        services.push({
          name: "Cache (Redis)",
          status: ms < 500 ? "Operational" : "Degraded",
          latency: `${ms}ms`,
        });
      } catch (err) {
        services.push({
          name: "Cache (Redis)",
          status: "Down",
          latency: "—",
          detail: (err as Error).message,
        });
      }
    }

    // Background jobs (Bull queues) run on Redis. Their availability tracks the
    // Redis connection state.
    if (!redisEnabled) {
      services.push({
        name: "Job Queues",
        status: "Not Configured",
        latency: "—",
        detail: "Background processing disabled without Redis",
      });
    } else {
      services.push({
        name: "Job Queues",
        status: redisAvailable ? "Operational" : "Down",
        latency: "—",
        detail: redisAvailable ? undefined : "Redis connection unavailable",
      });
    }

    // Email delivery — configured when either SMTP or SendGrid credentials are
    // present. We report configuration state without sending a probe email.
    const emailConfigured = Boolean(
      (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) || env.SENDGRID_API_KEY
    );
    services.push({
      name: "Email Delivery",
      status: emailConfigured ? "Operational" : "Not Configured",
      latency: "—",
      detail: emailConfigured
        ? env.SENDGRID_API_KEY
          ? "SendGrid"
          : `SMTP ${env.SMTP_HOST}`
        : "No SMTP or SendGrid credentials set",
    });

    // SMS delivery — Termii.
    services.push({
      name: "SMS Delivery",
      status: env.TERMII_API_KEY ? "Operational" : "Not Configured",
      latency: "—",
      detail: env.TERMII_API_KEY ? "Termii" : "TERMII_API_KEY not set",
    });

    // File storage — Cloudinary.
    const storageConfigured = Boolean(
      env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
    );
    services.push({
      name: "File Storage",
      status: storageConfigured ? "Operational" : "Not Configured",
      latency: "—",
      detail: storageConfigured ? "Cloudinary" : "Cloudinary credentials not set",
    });

    // Payments — Paystack.
    services.push({
      name: "Payments",
      status: env.PAYSTACK_SECRET_KEY ? "Operational" : "Not Configured",
      latency: "—",
      detail: env.PAYSTACK_SECRET_KEY ? "Paystack" : "PAYSTACK_SECRET_KEY not set",
    });

    // API process — always reachable if this code is running.
    services.push({ name: "API Gateway", status: "Operational", latency: "—" });

    // Overall status ignores "Not Configured" services — an unconfigured
    // optional integration shouldn't mark the platform as degraded.
    const overall = services.some((s) => s.status === "Down")
      ? "Down"
      : services.some((s) => s.status === "Degraded")
        ? "Degraded"
        : "Operational";

    return {
      overall,
      services,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  static async getSettings() {
    const rows = await prisma.platformSetting.findMany();
    const settings: Record<string, unknown> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }

    // Merge stored values over defaults so the client always receives a
    // complete, well-typed settings object.
    return { ...DEFAULT_SETTINGS, ...settings };
  }

  static async updateSettings(
    patch: Record<string, unknown>,
    actor: { id: string; ipAddress?: string; userAgent?: string }
  ) {
    const allowedKeys = Object.keys(DEFAULT_SETTINGS);
    const entries = Object.entries(patch).filter(([key]) =>
      allowedKeys.includes(key)
    );

    if (entries.length === 0) {
      throw ApiError.badRequest("No valid settings provided");
    }

    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.platformSetting.upsert({
          where: { key },
          create: { key, value: value as any },
          update: { value: value as any },
        })
      )
    );

    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: "PLATFORM_SETTINGS_UPDATED",
        resource: "PlatformSetting",
        details: { keys: entries.map(([k]) => k) },
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
      },
    });

    return this.getSettings();
  }
}

// Default platform settings — the source of truth for which keys exist and
// their fallback values when nothing is stored yet.
const DEFAULT_SETTINGS = {
  platformName: "AgroTrack",
  supportEmail: "support@agrotrack.ng",
  defaultCurrency: "NGN",
  maintenanceMode: false,
  allowNewRegistrations: true,
  emailNotifications: true,
  apiRateLimiting: true,
  debugMode: false,
} as const;
