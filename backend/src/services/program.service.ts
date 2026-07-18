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

  static async getStats(id: string, lenderOrgId: string) {
    const program = await prisma.program.findFirst({
      where: { id, lenderOrgId },
      include: {
        loans: {
          include: {
            disbursements: { where: { status: "COMPLETED" } },
            repayments: { where: { status: "PAID" } },
          },
        },
        applications: true,
      },
    });

    if (!program) throw ApiError.notFound("Program not found");

    const totalFund = program.totalFund ? Number(program.totalFund) : 0;
    const totalDisbursed = program.loans.reduce(
      (sum, loan) => sum + loan.disbursements.reduce((s, d) => s + Number(d.amount), 0),
      0
    );
    const totalRepaid = program.loans.reduce(
      (sum, loan) => sum + loan.repayments.reduce((s, r) => s + Number(r.paidAmount || r.amount), 0),
      0
    );
    const remainingFund = totalFund > 0 ? totalFund - totalDisbursed : null;

    const applicationsByStatus = {
      total: program.applications.length,
      pending: program.applications.filter((a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW").length,
      approved: program.applications.filter((a) => a.status === "APPROVED").length,
      rejected: program.applications.filter((a) => a.status === "REJECTED").length,
    };

    const loansByStatus = {
      total: program.loans.length,
      active: program.loans.filter((l) => l.status === "ACTIVE").length,
      completed: program.loans.filter((l) => l.status === "COMPLETED").length,
      defaulted: program.loans.filter((l) => l.status === "DEFAULTED").length,
    };

    const avgLoanAmount = program.loans.length > 0
      ? program.loans.reduce((sum, l) => sum + Number(l.amount), 0) / program.loans.length
      : 0;

    const repaymentRate = totalDisbursed > 0 ? (totalRepaid / totalDisbursed) * 100 : 0;

    return {
      totalFund,
      totalDisbursed,
      totalRepaid,
      remainingFund,
      applicationsByStatus,
      loansByStatus,
      avgLoanAmount,
      repaymentRate: Math.round(repaymentRate * 100) / 100,
    };
  }

  static async close(id: string, lenderOrgId: string, forceClose = false) {
    const program = await prisma.program.findFirst({
      where: { id, lenderOrgId },
      include: {
        applications: { where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } },
      },
    });

    if (!program) throw ApiError.notFound("Program not found");
    if (program.status === "CLOSED") throw ApiError.badRequest("Program is already closed");

    if (program.applications.length > 0 && !forceClose) {
      throw ApiError.badRequest(
        `Cannot close program with ${program.applications.length} pending applications. Use forceClose to auto-reject them.`
      );
    }

    return prisma.$transaction(async (tx) => {
      if (forceClose && program.applications.length > 0) {
        await tx.application.updateMany({
          where: {
            programId: id,
            status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
          },
          data: {
            status: "REJECTED",
            rejectionReason: "Program closed by lender",
          },
        });
      }

      const updated = await tx.program.update({
        where: { id },
        data: { status: "CLOSED" },
      });

      return updated;
    });
  }

  static async duplicate(id: string, lenderOrgId: string) {
    const program = await prisma.program.findFirst({ where: { id, lenderOrgId } });
    if (!program) throw ApiError.notFound("Program not found");

    const { id: _, createdAt, updatedAt, lenderOrgId: orgId, ...data } = program;

    return prisma.program.create({
      data: {
        ...data,
        name: `${program.name} (Copy)`,
        status: "DRAFT",
        lenderOrg: { connect: { id: lenderOrgId } },
      },
    });
  }
}
