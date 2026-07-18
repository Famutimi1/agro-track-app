import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { getPagination, paginatedResponse, PaginationQuery } from "../utils/pagination";
import { AuthService } from "./auth.service";
import { logger } from "../config/logger";

interface AgentQuery extends PaginationQuery {
  state?: string;
  active?: boolean;
  search?: string;
}

interface TaskInput {
  taskType: "REGISTRATION" | "VERIFICATION" | "MONITORING";
  borrowerId: string;
  dueDate: Date;
  priority: "LOW" | "MEDIUM" | "HIGH";
  notes?: string;
}

export class FieldAgentService {
  static async create(data: {
    email: string;
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
    state: string;
    lga?: string;
    coverageArea?: string[];
    supervisorId?: string;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw ApiError.conflict("Email already registered");

    const passwordHash = await AuthService.hashPassword(data.password);
    const agentCode = await this.generateAgentCode(data.state);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "FIELD_AGENT",
        emailVerified: false,
        agentProfile: {
          create: {
            agentCode,
            state: data.state,
            lga: data.lga,
            coverageArea: data.coverageArea || [],
            supervisorId: data.supervisorId,
          },
        },
      },
      include: { agentProfile: true },
    });

    logger.info("Field agent created", { agentCode, state: data.state });

    return user;
  }

  static async getAll(query: AgentQuery) {
    const { page, limit, skip } = getPagination(query);
    const where: Prisma.FieldAgentProfileWhereInput = {};

    if (query.state) where.state = query.state;
    if (query.active !== undefined) where.active = query.active === true || query.active === "true" as any;
    if (query.search) {
      where.user = {
        OR: [
          { firstName: { contains: query.search, mode: "insensitive" } },
          { lastName: { contains: query.search, mode: "insensitive" } },
          { email: { contains: query.search, mode: "insensitive" } },
        ],
      };
    }

    const [agents, total] = await Promise.all([
      prisma.fieldAgentProfile.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
          _count: { select: { visits: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.fieldAgentProfile.count({ where }),
    ]);

    const formatted = agents.map((a) => ({
      ...a,
      totalEarnings: Number(a.totalEarnings),
    }));

    return paginatedResponse(formatted, total, page, limit);
  }

  static async getById(id: string) {
    const agent = await prisma.fieldAgentProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true, createdAt: true } },
        visits: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            agent: false,
          },
        },
      },
    });
    if (!agent) throw ApiError.notFound("Field agent not found");

    return {
      ...agent,
      totalEarnings: Number(agent.totalEarnings),
    };
  }

  static async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalAgents,
      activeAgents,
      registrationsThisMonth,
      verificationsThisMonth,
      totalPaidThisMonth,
    ] = await Promise.all([
      prisma.fieldAgentProfile.count(),
      prisma.fieldAgentProfile.count({ where: { active: true } }),
      prisma.fieldAgentProfile.aggregate({
        _sum: { registrations: true },
      }),
      prisma.fieldAgentProfile.aggregate({
        _sum: { verifications: true },
      }),
      prisma.fieldVisit.count({
        where: { completedAt: { gte: startOfMonth } },
      }),
    ]);

    return {
      totalAgents,
      activeAgents,
      farmersRegisteredThisMonth: registrationsThisMonth._sum.registrations || 0,
      farmsVerifiedThisMonth: verificationsThisMonth._sum.verifications || 0,
      visitsThisMonth: totalPaidThisMonth,
    };
  }

  static async getByUserId(userId: string) {
    const agent = await prisma.fieldAgentProfile.findUnique({
      where: { userId },
      include: { visits: { orderBy: { createdAt: "desc" }, take: 5 } },
    });
    if (!agent) throw ApiError.notFound("Field agent profile not found");
    return {
      ...agent,
      totalEarnings: Number(agent.totalEarnings),
    };
  }

  static async update(id: string, data: Partial<{
    state: string;
    lga: string;
    coverageArea: string[];
    commissionRate: number;
    active: boolean;
  }>) {
    return prisma.fieldAgentProfile.update({
      where: { id },
      data,
    });
  }

  static async activate(id: string, activatedBy: string) {
    const agent = await prisma.fieldAgentProfile.findUnique({ where: { id } });
    if (!agent) throw ApiError.notFound("Field agent not found");

    const updated = await prisma.fieldAgentProfile.update({
      where: { id },
      data: { active: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: activatedBy,
        action: "AGENT_ACTIVATED",
        resource: "FIELD_AGENT",
        resourceId: id,
        details: { agentCode: agent.agentCode },
      },
    });

    logger.info("Field agent activated", { id, agentCode: agent.agentCode });

    return updated;
  }

  static async deactivate(id: string, reason: string, deactivatedBy: string) {
    const agent = await prisma.fieldAgentProfile.findUnique({ where: { id } });
    if (!agent) throw ApiError.notFound("Field agent not found");

    const updated = await prisma.fieldAgentProfile.update({
      where: { id },
      data: { active: false },
    });

    await prisma.auditLog.create({
      data: {
        userId: deactivatedBy,
        action: "AGENT_DEACTIVATED",
        resource: "FIELD_AGENT",
        resourceId: id,
        details: { agentCode: agent.agentCode, reason },
      },
    });

    logger.info("Field agent deactivated", { id, reason });

    return updated;
  }

  static async getTasks(agentId: string, query: PaginationQuery & { status?: string }) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.FieldVisitWhereInput = { agentId };
    if (query.status) where.status = query.status;

    const [tasks, total] = await Promise.all([
      prisma.fieldVisit.findMany({
        where,
        orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.fieldVisit.count({ where }),
    ]);

    return paginatedResponse(tasks, total, page, limit);
  }

  static async assignTask(agentId: string, data: TaskInput, assignedBy: string) {
    const agent = await prisma.fieldAgentProfile.findUnique({ where: { id: agentId } });
    if (!agent) throw ApiError.notFound("Field agent not found");
    if (!agent.active) throw ApiError.badRequest("Cannot assign tasks to inactive agent");

    const task = await prisma.fieldVisit.create({
      data: {
        agentId,
        borrowerId: data.borrowerId,
        purpose: data.taskType,
        notes: data.notes,
        status: "SCHEDULED",
        scheduledAt: data.dueDate,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: assignedBy,
        action: "TASK_ASSIGNED",
        resource: "FIELD_VISIT",
        resourceId: task.id,
        details: { agentId, taskType: data.taskType, priority: data.priority },
      },
    });

    logger.info("Task assigned to agent", { agentId, taskId: task.id, taskType: data.taskType });

    return task;
  }

  static async getEarnings(agentId: string) {
    const agent = await prisma.fieldAgentProfile.findUnique({ where: { id: agentId } });
    if (!agent) throw ApiError.notFound("Field agent not found");

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const completedThisMonth = await prisma.fieldVisit.count({
      where: {
        agentId,
        status: "COMPLETED",
        completedAt: { gte: startOfMonth },
      },
    });

    const RATES = {
      registration: 1500,
      verification: 1000,
      monitoring: 500,
    };

    const registrationsEarning = agent.registrations * RATES.registration;
    const verificationsEarning = agent.verifications * RATES.verification;
    const inspectionsEarning = agent.inspections * RATES.monitoring;

    const thisMonthEarning = completedThisMonth * RATES.monitoring;

    return {
      rates: RATES,
      lifetime: {
        registrations: { count: agent.registrations, amount: registrationsEarning },
        verifications: { count: agent.verifications, amount: verificationsEarning },
        inspections: { count: agent.inspections, amount: inspectionsEarning },
        total: Number(agent.totalEarnings),
      },
      thisMonth: {
        visits: completedThisMonth,
        estimated: thisMonthEarning,
      },
      pendingPayout: Number(agent.totalEarnings),
    };
  }

  static async approvePayout(agentId: string, amount: number, approvedBy: string) {
    const agent = await prisma.fieldAgentProfile.findUnique({
      where: { id: agentId },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
    if (!agent) throw ApiError.notFound("Field agent not found");

    if (amount > Number(agent.totalEarnings)) {
      throw ApiError.badRequest("Payout amount exceeds available earnings");
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.fieldAgentProfile.update({
        where: { id: agentId },
        data: {
          totalEarnings: { decrement: amount },
        },
      });

      await tx.auditLog.create({
        data: {
          userId: approvedBy,
          action: "AGENT_PAYOUT_APPROVED",
          resource: "FIELD_AGENT",
          resourceId: agentId,
          details: {
            amount,
            agentCode: agent.agentCode,
            agentName: `${agent.user.firstName} ${agent.user.lastName}`,
          },
        },
      });

      return { success: true, amount };
    });

    logger.info("Agent payout approved", { agentId, amount });

    return result;
  }

  static async getVerifications(agentId: string, query: PaginationQuery) {
    const { page, limit, skip } = getPagination(query);

    const [verifications, total] = await Promise.all([
      prisma.fieldVisit.findMany({
        where: {
          agentId,
          purpose: { in: ["VERIFICATION", "REGISTRATION"] },
          status: "COMPLETED",
        },
        orderBy: { completedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.fieldVisit.count({
        where: {
          agentId,
          purpose: { in: ["VERIFICATION", "REGISTRATION"] },
          status: "COMPLETED",
        },
      }),
    ]);

    return paginatedResponse(verifications, total, page, limit);
  }

  static async getQualitySamples(agentId: string, count: number = 5) {
    const samples = await prisma.fieldVisit.findMany({
      where: {
        agentId,
        status: "COMPLETED",
        images: { isEmpty: false },
      },
      orderBy: { completedAt: "desc" },
      take: count * 2,
    });

    const shuffled = samples.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  static async rateVerification(visitId: string, rating: number, notes: string, ratedBy: string) {
    if (rating < 1 || rating > 5) throw ApiError.badRequest("Rating must be between 1 and 5");

    const visit = await prisma.fieldVisit.findUnique({
      where: { id: visitId },
      include: { agent: true },
    });
    if (!visit) throw ApiError.notFound("Visit not found");

    await prisma.$transaction(async (tx) => {
      await tx.fieldVisit.update({
        where: { id: visitId },
        data: { rating },
      });

      const agent = visit.agent;
      const newTotalRatings = agent.totalRatings + 1;
      const newRating = (agent.rating * agent.totalRatings + rating) / newTotalRatings;

      await tx.fieldAgentProfile.update({
        where: { id: agent.id },
        data: {
          rating: Math.round(newRating * 10) / 10,
          totalRatings: newTotalRatings,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: ratedBy,
          action: "VERIFICATION_RATED",
          resource: "FIELD_VISIT",
          resourceId: visitId,
          details: { rating, notes, agentId: agent.id },
        },
      });
    });

    logger.info("Verification rated", { visitId, rating });

    return { success: true };
  }

  static async recordVisit(agentUserId: string, data: {
    borrowerId?: string;
    purpose: string;
    notes?: string;
    latitude?: number;
    longitude?: number;
    images?: string[];
  }) {
    const agent = await prisma.fieldAgentProfile.findUnique({ where: { userId: agentUserId } });
    if (!agent) throw ApiError.notFound("Field agent profile not found");

    const visit = await prisma.fieldVisit.create({
      data: {
        agentId: agent.id,
        borrowerId: data.borrowerId,
        purpose: data.purpose,
        notes: data.notes,
        latitude: data.latitude,
        longitude: data.longitude,
        images: data.images || [],
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    const earningAmount = data.purpose === "REGISTRATION" ? 1500 :
                          data.purpose === "VERIFICATION" ? 1000 : 500;

    await prisma.fieldAgentProfile.update({
      where: { id: agent.id },
      data: {
        inspections: { increment: 1 },
        totalEarnings: { increment: earningAmount },
        lastActivityAt: new Date(),
        ...(data.purpose === "REGISTRATION" && { registrations: { increment: 1 } }),
        ...(data.purpose === "VERIFICATION" && { verifications: { increment: 1 } }),
      },
    });

    return visit;
  }

  static async scheduleVisit(agentUserId: string, data: {
    borrowerId: string;
    purpose: string;
    scheduledAt: Date;
  }) {
    const agent = await prisma.fieldAgentProfile.findUnique({ where: { userId: agentUserId } });
    if (!agent) throw ApiError.notFound("Field agent profile not found");

    return prisma.fieldVisit.create({
      data: {
        agentId: agent.id,
        borrowerId: data.borrowerId,
        purpose: data.purpose,
        status: "SCHEDULED",
        scheduledAt: data.scheduledAt,
      },
    });
  }

  static async getVisits(agentUserId: string, query: PaginationQuery & { status?: string }) {
    const agent = await prisma.fieldAgentProfile.findUnique({ where: { userId: agentUserId } });
    if (!agent) throw ApiError.notFound("Field agent profile not found");

    const { page, limit, skip } = getPagination(query);
    const where: Prisma.FieldVisitWhereInput = { agentId: agent.id };
    if (query.status) where.status = query.status;

    const [visits, total] = await Promise.all([
      prisma.fieldVisit.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.fieldVisit.count({ where }),
    ]);

    return paginatedResponse(visits, total, page, limit);
  }

  static async getDashboard(agentUserId: string) {
    const agent = await prisma.fieldAgentProfile.findUnique({
      where: { userId: agentUserId },
    });
    if (!agent) throw ApiError.notFound("Field agent profile not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingVisits, completedToday] = await Promise.all([
      prisma.fieldVisit.count({
        where: { agentId: agent.id, status: "SCHEDULED" },
      }),
      prisma.fieldVisit.count({
        where: { agentId: agent.id, completedAt: { gte: today } },
      }),
    ]);

    return {
      agent: { ...agent, totalEarnings: Number(agent.totalEarnings) },
      stats: {
        totalRegistrations: agent.registrations,
        totalVerifications: agent.verifications,
        totalInspections: agent.inspections,
        rating: agent.rating,
        totalEarnings: Number(agent.totalEarnings),
        pendingVisits,
        completedToday,
      },
    };
  }

  static async rateAgent(agentId: string, rating: number) {
    if (rating < 1 || rating > 5) throw ApiError.badRequest("Rating must be between 1 and 5");

    const agent = await prisma.fieldAgentProfile.findUnique({ where: { id: agentId } });
    if (!agent) throw ApiError.notFound("Field agent not found");

    const newTotalRatings = agent.totalRatings + 1;
    const newRating = (agent.rating * agent.totalRatings + rating) / newTotalRatings;

    return prisma.fieldAgentProfile.update({
      where: { id: agentId },
      data: {
        rating: Math.round(newRating * 10) / 10,
        totalRatings: newTotalRatings,
      },
    });
  }

  private static async generateAgentCode(state: string): Promise<string> {
    const stateCode = state.slice(0, 2).toUpperCase();
    const count = await prisma.fieldAgentProfile.count({ where: { state } });
    return `AGT-${stateCode}-${String(count + 1).padStart(3, "0")}`;
  }
}
