import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "./api-error";

// Retry serialization conflicts; all callback work must stay inside the DB.
export async function serializable<T>(work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try { return await prisma.$transaction(work, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }); }
    catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2034") throw error;
      if (attempt === 2) throw ApiError.conflict("This record changed. Please retry your request.");
    }
  }
  throw ApiError.conflict("Please retry your request");
}
