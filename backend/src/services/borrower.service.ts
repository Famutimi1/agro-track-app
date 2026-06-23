import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { getPagination, paginatedResponse, PaginationQuery } from "../utils/pagination";

interface BorrowerQuery extends PaginationQuery {
  search?: string;
  crop?: string;
  state?: string;
  tier?: string;
}

export class BorrowerService {
  static async getAll(lenderOrgId: string, query: BorrowerQuery) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.BorrowerProfileWhereInput = {
      loans: { some: { program: { lenderOrgId } } },
    };

    if (query.search && query.search.length <= 100) {
      where.user = {
        OR: [
          { firstName: { contains: query.search, mode: "insensitive" } },
          { lastName: { contains: query.search, mode: "insensitive" } },
          { email: { contains: query.search, mode: "insensitive" } },
        ],
      };
    }
    if (query.crop) where.primaryCrop = query.crop;
    if (query.state) where.state = query.state;
    if (query.tier) where.farmScoreTier = query.tier;

    const [borrowers, total] = await Promise.all([
      prisma.borrowerProfile.findMany({
        where, skip, take: limit,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
          _count: { select: { loans: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.borrowerProfile.count({ where }),
    ]);

    return paginatedResponse(borrowers, total, page, limit);
  }

  static async getById(id: string) {
    const borrower = await prisma.borrowerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true, createdAt: true } },
        loans: { include: { program: { select: { name: true, interestRate: true } }, repayments: true } },
        farmReports: { take: 5, orderBy: { createdAt: "desc" } },
        scoreHistory: { take: 10, orderBy: { calculatedAt: "desc" } },
      },
    });
    if (!borrower) throw ApiError.notFound("Borrower not found");
    return borrower;
  }

  static async getByIdForLender(id: string, lenderOrgId: string) {
    const borrower = await prisma.borrowerProfile.findFirst({
      where: {
        id,
        loans: { some: { program: { lenderOrgId } } },
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true, createdAt: true } },
        loans: {
          where: { program: { lenderOrgId } },
          include: { program: { select: { name: true, interestRate: true } }, repayments: true },
        },
        farmReports: { take: 5, orderBy: { createdAt: "desc" } },
        scoreHistory: { take: 10, orderBy: { calculatedAt: "desc" } },
      },
    });
    if (!borrower) throw ApiError.notFound("Borrower not found or access denied");
    return borrower;
  }

  static async getMyProfile(userId: string) {
    const borrower = await prisma.borrowerProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
        loans: { include: { program: { select: { name: true, interestRate: true, lenderOrg: { select: { name: true } } } }, repayments: true } },
        farmReports: { take: 10, orderBy: { createdAt: "desc" } },
        scoreHistory: { take: 10, orderBy: { calculatedAt: "desc" } },
      },
    });
    if (!borrower) throw ApiError.notFound("Borrower profile not found");
    return borrower;
  }
}
