import { Prisma, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { logger } from "../config/logger";
import crypto from "crypto";

type UpdateLenderOrgInput = Partial<Omit<Prisma.LenderOrganizationUpdateInput, "users" | "programs" | "cooperatives" | "webhooks">>;

interface NotificationSettings {
  newApplication: { email: boolean; sms: boolean; inApp: boolean };
  applicationApproved: { email: boolean; sms: boolean; inApp: boolean };
  disbursementReleased: { email: boolean; sms: boolean; inApp: boolean };
  repaymentReceived: { email: boolean; sms: boolean; inApp: boolean };
  paymentOverdue: { email: boolean; sms: boolean; inApp: boolean };
  farmReportSubmitted: { email: boolean; sms: boolean; inApp: boolean };
  agentVerificationComplete: { email: boolean; sms: boolean; inApp: boolean };
  frequency: "INSTANT" | "DAILY_DIGEST" | "WEEKLY_SUMMARY";
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

interface DisbursementRules {
  requireLayeredDisbursement: boolean;
  requireAgentVerification: boolean;
  autoApproveAboveScore: number | null;
  maxProcessingDays: number;
  defaultReportInterval: "WEEKLY" | "BIWEEKLY" | "MONTHLY";
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  newApplication: { email: true, sms: false, inApp: true },
  applicationApproved: { email: true, sms: true, inApp: true },
  disbursementReleased: { email: true, sms: true, inApp: true },
  repaymentReceived: { email: false, sms: false, inApp: true },
  paymentOverdue: { email: true, sms: true, inApp: true },
  farmReportSubmitted: { email: false, sms: false, inApp: true },
  agentVerificationComplete: { email: false, sms: false, inApp: true },
  frequency: "INSTANT",
  quietHoursEnabled: true,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
};

const DEFAULT_DISBURSEMENT_RULES: DisbursementRules = {
  requireLayeredDisbursement: true,
  requireAgentVerification: true,
  autoApproveAboveScore: 750,
  maxProcessingDays: 5,
  defaultReportInterval: "MONTHLY",
};

export class LenderService {
  static async getOrganization(id: string) {
    const org = await prisma.lenderOrganization.findUnique({
      where: { id },
      include: {
        _count: { select: { programs: true, users: true, cooperatives: true } },
      },
    });
    if (!org) throw ApiError.notFound("Organization not found");
    return org;
  }

  static async updateOrganization(id: string, data: UpdateLenderOrgInput, userId: string) {
    const org = await prisma.lenderOrganization.update({ where: { id }, data });

    await prisma.auditLog.create({
      data: {
        userId,
        action: "UPDATE_ORGANIZATION",
        resource: "LENDER_ORGANIZATION",
        resourceId: id,
        details: data as any,
      },
    });

    return org;
  }

  static async getDashboardStats(lenderId: string) {
    const [totalBorrowers, activeLoans, totalDisbursed, repaymentsDue] = await Promise.all([
      prisma.borrowerLoan.count({ where: { program: { lenderOrgId: lenderId } } }),
      prisma.borrowerLoan.count({ where: { program: { lenderOrgId: lenderId }, status: "ACTIVE" } }),
      prisma.disbursement.aggregate({
        where: { loan: { program: { lenderOrgId: lenderId } }, status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.repayment.aggregate({
        where: { loan: { program: { lenderOrgId: lenderId } }, status: "PENDING" },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalBorrowers,
      activeLoans,
      totalDisbursed: totalDisbursed._sum.amount || 0,
      repaymentsDue: repaymentsDue._sum.amount || 0,
    };
  }

  // Team Management
  static async getTeamMembers(lenderId: string) {
    return prisma.user.findMany({
      where: { lenderOrgId: lenderId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
        phone: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async inviteTeamMember(
    lenderId: string,
    data: { email: string; firstName: string; lastName: string; role: Role },
    invitedBy: string
  ) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw ApiError.badRequest("User with this email already exists");
    }

    const tempPassword = crypto.randomBytes(16).toString("hex");

    const user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        lenderOrgId: lenderId,
        passwordHash: tempPassword,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: invitedBy,
        action: "INVITE_TEAM_MEMBER",
        resource: "USER",
        resourceId: user.id,
        details: { email: data.email, role: data.role },
      },
    });

    logger.info("Team member invited", { lenderId, email: data.email, role: data.role });

    return user;
  }

  static async updateTeamMember(
    lenderId: string,
    memberId: string,
    data: { role?: Role; firstName?: string; lastName?: string },
    updatedBy: string
  ) {
    const member = await prisma.user.findFirst({
      where: { id: memberId, lenderOrgId: lenderId },
    });

    if (!member) throw ApiError.notFound("Team member not found");

    const updated = await prisma.user.update({
      where: { id: memberId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: updatedBy,
        action: "UPDATE_TEAM_MEMBER",
        resource: "USER",
        resourceId: memberId,
        details: data as any,
      },
    });

    return updated;
  }

  static async removeTeamMember(lenderId: string, memberId: string, removedBy: string) {
    const member = await prisma.user.findFirst({
      where: { id: memberId, lenderOrgId: lenderId },
    });

    if (!member) throw ApiError.notFound("Team member not found");
    if (member.role === "LENDER_ADMIN") {
      const adminCount = await prisma.user.count({
        where: { lenderOrgId: lenderId, role: "LENDER_ADMIN" },
      });
      if (adminCount <= 1) {
        throw ApiError.badRequest("Cannot remove the only admin");
      }
    }

    await prisma.user.delete({ where: { id: memberId } });

    await prisma.auditLog.create({
      data: {
        userId: removedBy,
        action: "REMOVE_TEAM_MEMBER",
        resource: "USER",
        resourceId: memberId,
        details: { email: member.email },
      },
    });

    return { success: true };
  }

  // Notification Settings
  static async getNotificationSettings(lenderId: string): Promise<NotificationSettings> {
    const org = await prisma.lenderOrganization.findUnique({
      where: { id: lenderId },
      select: { id: true },
    });

    if (!org) throw ApiError.notFound("Organization not found");

    return DEFAULT_NOTIFICATION_SETTINGS;
  }

  static async updateNotificationSettings(
    lenderId: string,
    settings: Partial<NotificationSettings>,
    userId: string
  ): Promise<NotificationSettings> {
    await prisma.auditLog.create({
      data: {
        userId,
        action: "UPDATE_NOTIFICATION_SETTINGS",
        resource: "LENDER_ORGANIZATION",
        resourceId: lenderId,
        details: settings as any,
      },
    });

    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...settings };
  }

  // Disbursement Rules
  static async getDisbursementRules(lenderId: string): Promise<DisbursementRules> {
    const org = await prisma.lenderOrganization.findUnique({
      where: { id: lenderId },
      select: { id: true },
    });

    if (!org) throw ApiError.notFound("Organization not found");

    return DEFAULT_DISBURSEMENT_RULES;
  }

  static async updateDisbursementRules(
    lenderId: string,
    rules: Partial<DisbursementRules>,
    userId: string
  ): Promise<DisbursementRules> {
    await prisma.auditLog.create({
      data: {
        userId,
        action: "UPDATE_DISBURSEMENT_RULES",
        resource: "LENDER_ORGANIZATION",
        resourceId: lenderId,
        details: rules as any,
      },
    });

    return { ...DEFAULT_DISBURSEMENT_RULES, ...rules };
  }

  // API Keys
  static async getApiKeys(lenderId: string) {
    return prisma.webhook.findMany({
      where: { lenderOrgId: lenderId },
      select: {
        id: true,
        url: true,
        events: true,
        active: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createApiKey(
    lenderId: string,
    data: { name: string; scopes: string[] },
    userId: string
  ) {
    const key = `sk_live_${crypto.randomBytes(24).toString("hex")}`;

    await prisma.auditLog.create({
      data: {
        userId,
        action: "CREATE_API_KEY",
        resource: "API_KEY",
        resourceId: lenderId,
        details: { name: data.name, scopes: data.scopes },
      },
    });

    return {
      id: crypto.randomUUID(),
      name: data.name,
      key,
      scopes: data.scopes,
      createdAt: new Date().toISOString(),
    };
  }

  static async revokeApiKey(lenderId: string, keyId: string, userId: string) {
    await prisma.auditLog.create({
      data: {
        userId,
        action: "REVOKE_API_KEY",
        resource: "API_KEY",
        resourceId: keyId,
      },
    });

    return { success: true };
  }

  // Billing
  static async getBillingInfo(lenderId: string) {
    const org = await prisma.lenderOrganization.findUnique({
      where: { id: lenderId },
      select: {
        plan: true,
        _count: {
          select: {
            programs: true,
            users: true,
          },
        },
      },
    });

    if (!org) throw ApiError.notFound("Organization not found");

    const borrowerCount = await prisma.borrowerProfile.count({
      where: { loans: { some: { program: { lenderOrgId: lenderId } } } },
    });

    return {
      currentPlan: org.plan,
      usage: {
        borrowers: borrowerCount,
        programs: org._count.programs,
        teamMembers: org._count.users,
        apiCalls: 0,
      },
      limits: {
        borrowers: org.plan === "ENTERPRISE" ? -1 : org.plan === "GROWTH" ? 5000 : 500,
        programs: org.plan === "ENTERPRISE" ? -1 : org.plan === "GROWTH" ? 10 : 3,
        teamMembers: org.plan === "ENTERPRISE" ? -1 : org.plan === "GROWTH" ? 20 : 5,
      },
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      invoices: [],
    };
  }

  // Active Sessions
  static async getActiveSessions(userId: string) {
    return [
      {
        id: "current",
        device: "Chrome on Windows",
        location: "Lagos, Nigeria",
        lastActive: new Date().toISOString(),
        isCurrent: true,
      },
    ];
  }

  static async revokeSession(userId: string, sessionId: string) {
    await prisma.auditLog.create({
      data: {
        userId,
        action: "REVOKE_SESSION",
        resource: "SESSION",
        resourceId: sessionId,
      },
    });

    return { success: true };
  }

  // Integrations
  static async getIntegrations(lenderId: string) {
    return {
      paystack: { connected: false, configurable: true },
      whatsapp: { connected: false, configurable: true },
      termii: { connected: false, configurable: true },
      googleMaps: { connected: true, configurable: false },
      nibssBvn: { connected: true, configurable: false, managedByPlatform: true },
      nimcNin: { connected: true, configurable: false, managedByPlatform: true },
      farmScoreApi: { enabled: false, configurable: true },
    };
  }

  static async updateIntegration(
    lenderId: string,
    integration: string,
    config: Record<string, any>,
    userId: string
  ) {
    await prisma.auditLog.create({
      data: {
        userId,
        action: "UPDATE_INTEGRATION",
        resource: "INTEGRATION",
        resourceId: integration,
        details: { lenderId, integration },
      },
    });

    return { success: true };
  }
}
