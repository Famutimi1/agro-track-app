import { DocumentType, VerificationStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/api-error";
import { S3Service } from "./s3.service";
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

    const { key, url } = await S3Service.uploadFile(
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

  static async getSignedUploadUrl(data: {
    type: DocumentType;
    mimeType: string;
    borrowerId?: string;
    applicationId?: string;
  }) {
    const folder = data.borrowerId
      ? `borrowers/${data.borrowerId}`
      : data.applicationId
      ? `applications/${data.applicationId}`
      : "uploads";

    const { uploadUrl, key } = await S3Service.getSignedUploadUrl(folder, data.mimeType);

    return { uploadUrl, key };
  }

  static async confirmUpload(data: {
    key: string;
    type: DocumentType;
    fileName: string;
    fileSize: number;
    mimeType: string;
    userId?: string;
    borrowerId?: string;
    applicationId?: string;
  }) {
    const bucket = process.env.AWS_S3_BUCKET;
    const region = process.env.AWS_REGION || "eu-west-1";
    const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${data.key}`;

    return prisma.document.create({
      data: {
        userId: data.userId,
        borrowerId: data.borrowerId,
        applicationId: data.applicationId,
        type: data.type,
        fileName: data.fileName,
        fileUrl,
        fileSize: data.fileSize,
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

    // Extract key from URL
    const urlParts = doc.fileUrl.split(".amazonaws.com/");
    if (urlParts.length === 2) {
      await S3Service.deleteFile(urlParts[1]);
    }

    return prisma.document.delete({ where: { id } });
  }

  static async getSignedDownloadUrl(id: string): Promise<string> {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) throw ApiError.notFound("Document not found");

    const urlParts = doc.fileUrl.split(".amazonaws.com/");
    if (urlParts.length !== 2) throw ApiError.internal("Invalid document URL");

    return S3Service.getSignedDownloadUrl(urlParts[1]);
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
