import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { ApiError } from "../utils/api-error";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
});

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "audio/mpeg",
  "audio/wav",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export class S3Service {
  private static get bucket(): string {
    if (!env.AWS_S3_BUCKET) throw ApiError.internal("S3 bucket not configured");
    return env.AWS_S3_BUCKET;
  }

  static async uploadFile(
    buffer: Buffer,
    mimeType: string,
    folder: string,
    originalName?: string
  ): Promise<{ key: string; url: string }> {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw ApiError.badRequest(`File type ${mimeType} not allowed`);
    }

    if (buffer.length > MAX_FILE_SIZE) {
      throw ApiError.badRequest(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }

    const extension = this.getExtension(mimeType);
    const key = `${folder}/${crypto.randomUUID()}${extension}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        Metadata: originalName ? { originalName } : undefined,
      })
    );

    logger.info("File uploaded to S3", { key, mimeType, size: buffer.length });

    return {
      key,
      url: `https://${this.bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`,
    };
  }

  static async getSignedUploadUrl(
    folder: string,
    mimeType: string,
    expiresIn = 300
  ): Promise<{ uploadUrl: string; key: string }> {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw ApiError.badRequest(`File type ${mimeType} not allowed`);
    }

    const extension = this.getExtension(mimeType);
    const key = `${folder}/${crypto.randomUUID()}${extension}`;

    const uploadUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: mimeType,
      }),
      { expiresIn }
    );

    return { uploadUrl, key };
  }

  static async getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
      { expiresIn }
    );
  }

  static async deleteFile(key: string): Promise<void> {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );

    logger.info("File deleted from S3", { key });
  }

  private static getExtension(mimeType: string): string {
    const map: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "application/pdf": ".pdf",
      "audio/mpeg": ".mp3",
      "audio/wav": ".wav",
    };
    return map[mimeType] || "";
  }
}
