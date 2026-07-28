import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { ApiError } from "../utils/api-error";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw ApiError.internal("Cloudinary is not configured");
  }
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "audio/mpeg",
  "audio/wav",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export class CloudinaryService {
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

    ensureConfigured();

    const result = await new Promise<{ public_id: string; secure_url: string; resource_type: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: crypto.randomUUID(),
            resource_type: "auto",
            // Keep the original file name available in Cloudinary's context metadata.
            context: originalName ? { original_filename: originalName } : undefined,
          },
          (error, uploaded) => {
            if (error || !uploaded) return reject(error ?? new Error("Cloudinary upload failed"));
            resolve(uploaded as any);
          }
        );
        stream.end(buffer);
      }
    );

    logger.info("File uploaded to Cloudinary", {
      key: result.public_id,
      mimeType,
      size: buffer.length,
    });

    return { key: result.public_id, url: result.secure_url };
  }

  static async deleteFile(publicId: string, resourceType = "image"): Promise<void> {
    ensureConfigured();
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    logger.info("File deleted from Cloudinary", { key: publicId });
  }

  /**
   * Parses a Cloudinary secure URL into the public_id and resource_type needed
   * for delete/signing operations.
   * e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/folder/id.jpg
   */
  static parseUrl(url: string): { publicId: string; resourceType: string } | null {
    const match = url.match(
      /res\.cloudinary\.com\/[^/]+\/([^/]+)\/upload\/(?:v\d+\/)?(.+)$/
    );
    if (!match) return null;
    const resourceType = match[1];
    // Strip the file extension to recover the public_id.
    const publicId = match[2].replace(/\.[^/.]+$/, "");
    return { publicId, resourceType };
  }
}
