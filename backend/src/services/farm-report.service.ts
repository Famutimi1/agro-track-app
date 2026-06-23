import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { getPagination, paginatedResponse, PaginationQuery } from "../utils/pagination";

export class FarmReportService {
  static async create(userId: string, data: any) {
    const profile = await prisma.borrowerProfile.findUnique({ where: { userId } });
    if (!profile) throw ApiError.notFound("Borrower profile not found");

    return prisma.farmReport.create({
      data: {
        borrowerId: profile.id,
        type: data.type,
        title: data.title,
        description: data.description,
        cropStage: data.cropStage,
        healthRating: data.healthRating,
        images: data.images || [],
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });
  }

  static async getByBorrower(userId: string, query: PaginationQuery) {
    const { page, limit, skip } = getPagination(query);
    const profile = await prisma.borrowerProfile.findUnique({ where: { userId } });
    if (!profile) throw ApiError.notFound("Borrower profile not found");

    const where = { borrowerId: profile.id };
    const [reports, total] = await Promise.all([
      prisma.farmReport.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.farmReport.count({ where }),
    ]);

    return paginatedResponse(reports, total, page, limit);
  }

  static async getByLender(lenderOrgId: string, query: PaginationQuery) {
    const { page, limit, skip } = getPagination(query);
    const where = { borrower: { loans: { some: { program: { lenderOrgId } } } } };

    const [reports, total] = await Promise.all([
      prisma.farmReport.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        include: { borrower: { include: { user: { select: { firstName: true, lastName: true } } } } },
      }),
      prisma.farmReport.count({ where }),
    ]);

    return paginatedResponse(reports, total, page, limit);
  }
}
