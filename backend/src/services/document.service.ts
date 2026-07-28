import { DocumentType, VerificationStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { CloudinaryService } from "./cloudinary.service";
import { getPagination, paginatedResponse, PaginationQuery } from "../utils/pagination";

export class DocumentService {
  static async upload(data: {
    userId?: string;
    borrowerId?: string;
    applicationId?: string;
    type: DocumentType;
    buffer: Buffer;
    mimeType: string;
    originalName: string;
  }) {
    const folder = data.borrowerId
      ? `borrowers/${data.borrowerId}`
      : data.applicationId
      ? `applications/${data.applicationId}`
      : `users/${data.userId}`;

    const { key, url } = await CloudinaryService.uploadFile(
      data.buffer,
      data.mimeType,
      folder,
      data.originalName
    );

    return prisma.document.create({
      data: {
        userId: data.userId,
        borrowerId: data.borrowerId,
        applicationId: data.applicationId,
        type: data.type,
        fileName: data.originalName,
        fileUrl: url,
        fileSize: data.buffer.length,
        mimeType: data.mimeType,
        status: "PENDING",
      },
    });
  }

  static async verify(
    id: string,
    verifierId: string,
    status: "VERIFIED" | "FAILED",
    rejectionReason?: string
  ) {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) throw ApiError.notFound("Document not found");
    if (doc.status !== "PENDING") throw ApiError.badRequest("Document already reviewed");

    return prisma.document.update({
      where: { id },
      data: {
        status,
        verifiedBy: verifierId,
        verifiedAt: new Date(),
        rejectionReason,
      },
    });
  }

  static async getByBorrower(borrowerId: string, query: PaginationQuery & { type?: string }) {
    const { page, limit, skip } = getPagination(query);
    const where: any = { borrowerId };
    if (query.type) where.type = query.type as DocumentType;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.document.count({ where }),
    ]);

    return paginatedResponse(documents, total, page, limit);
  }

  static async getByApplication(applicationId: string) {
    return prisma.document.findMany({
      where: { applicationId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async delete(id: string) {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) throw ApiError.notFound("Document not found");

    // Extract the Cloudinary public_id from the delivery URL.
    const parsed = CloudinaryService.parseUrl(doc.fileUrl);
    if (parsed) {
      await CloudinaryService.deleteFile(parsed.publicId, parsed.resourceType);
    }

    return prisma.document.delete({ where: { id } });
  }

  static async getPendingForLender(lenderOrgId: string, query: PaginationQuery) {
    const { page, limit, skip } = getPagination(query);

    const where = {
      status: "PENDING" as VerificationStatus,
      OR: [
        { borrower: { loans: { some: { program: { lenderOrgId } } } } },
        { application: { program: { lenderOrgId } } },
      ],
    };

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          borrower: { include: { user: { select: { firstName: true, lastName: true } } } },
          application: { select: { id: true, program: { select: { name: true } } } },
        },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
      }),
      prisma.document.count({ where }),
    ]);

    return paginatedResponse(documents, total, page, limit);
  }
}
