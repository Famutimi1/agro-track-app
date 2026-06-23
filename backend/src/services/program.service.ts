import { Prisma, ProgramStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { getPagination, paginatedResponse, PaginationQuery } from "../utils/pagination";

type CreateProgramInput = Omit<Prisma.ProgramCreateInput, "lenderOrg">;
type UpdateProgramInput = Partial<Omit<Prisma.ProgramUpdateInput, "lenderOrg">>;

interface ProgramQueryFilters extends PaginationQuery {
  status?: ProgramStatus;
}

interface PublicProgramFilters extends PaginationQuery {
  crop?: string;
  state?: string;
}

export class ProgramService {
  static async create(lenderOrgId: string, data: CreateProgramInput) {
    return prisma.program.create({
      data: { ...data, lenderOrg: { connect: { id: lenderOrgId } } },
    });
  }

  static async getAll(lenderOrgId: string, query: ProgramQueryFilters) {
    const { page, limit, skip } = getPagination(query);
    const where: Prisma.ProgramWhereInput = { lenderOrgId };
    if (query.status) where.status = query.status;

    const [programs, total] = await Promise.all([
      prisma.program.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: { _count: { select: { loans: true } } } }),
      prisma.program.count({ where }),
    ]);

    return paginatedResponse(programs, total, page, limit);
  }

  static async getById(id: string, lenderOrgId: string) {
    const program = await prisma.program.findFirst({
      where: { id, lenderOrgId },
      include: { _count: { select: { loans: true } } },
    });
    if (!program) throw ApiError.notFound("Program not found");
    return program;
  }

  static async update(id: string, lenderOrgId: string, data: UpdateProgramInput) {
    const program = await prisma.program.findFirst({ where: { id, lenderOrgId } });
    if (!program) throw ApiError.notFound("Program not found");
    return prisma.program.update({ where: { id }, data });
  }

  static async toggleStatus(id: string, lenderOrgId: string) {
    const program = await prisma.program.findFirst({ where: { id, lenderOrgId } });
    if (!program) throw ApiError.notFound("Program not found");
    const newStatus = program.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    return prisma.program.update({ where: { id }, data: { status: newStatus } });
  }

  static async getPublicPrograms(query: PublicProgramFilters) {
    const { page, limit, skip } = getPagination(query);
    const where: Prisma.ProgramWhereInput = { status: "ACTIVE" };

    if (query.crop) where.targetCrops = { has: query.crop };
    if (query.state) where.targetStates = { has: query.state };

    const [programs, total] = await Promise.all([
      prisma.program.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        include: { lenderOrg: { select: { name: true, logoUrl: true } } },
      }),
      prisma.program.count({ where }),
    ]);

    return paginatedResponse(programs, total, page, limit);
  }
}
