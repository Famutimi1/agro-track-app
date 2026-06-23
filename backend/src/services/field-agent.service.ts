import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { getPagination, paginatedResponse, PaginationQuery } from "../utils/pagination";
import { AuthService } from "./auth.service";

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

    return user;
  }

  static async getAll(query: PaginationQuery & { state?: string; active?: boolean }) {
    const { page, limit, skip } = getPagination(query);
    const where: any = {};
    if (query.state) where.state = query.state;
    if (query.active !== undefined) where.active = query.active;

    const [agents, total] = await Promise.all([
      prisma.fieldAgentProfile.findMany({
        where,
        include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.fieldAgentProfile.count({ where }),
    ]);

    return paginatedResponse(agents, total, page, limit);
  }

  static async getById(id: string) {
    const agent = await prisma.fieldAgentProfile.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        visits: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
    if (!agent) throw ApiError.notFound("Field agent not found");
    return agent;
  }

  static async getByUserId(userId: string) {
    const agent = await prisma.fieldAgentProfile.findUnique({
      where: { userId },
      include: { visits: { orderBy: { createdAt: "desc" }, take: 5 } },
    });
    if (!agent) throw ApiError.notFound("Field agent profile not found");
    return agent;
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

    // Update agent stats
    await prisma.fieldAgentProfile.update({
      where: { id: agent.id },
      data: {
        inspections: { increment: 1 },
        lastActivityAt: new Date(),
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
    const where: any = { agentId: agent.id };
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
      agent,
      stats: {
        totalRegistrations: agent.registrations,
        totalVerifications: agent.verifications,
        totalInspections: agent.inspections,
        rating: agent.rating,
        totalEarnings: agent.totalEarnings,
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
