import { prisma } from "../config/prisma";
import { logger } from "../config/logger";
import { ApiError } from "../utils/api-error";
import { redis } from "../config/redis";

interface BvnData {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  phoneNumber: string;
  gender: string;
  enrollmentBank: string;
  enrollmentBranch: string;
}

interface NinData {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: string;
  photo?: string;
}

export class VerificationService {
  private static BVN_CACHE_TTL = 24 * 60 * 60; // 24 hours
  private static NIN_CACHE_TTL = 24 * 60 * 60;

  static async verifyBvn(bvn: string, borrowerId: string): Promise<BvnData> {
    const cacheKey = `bvn:${bvn}`;

    // Check cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      logger.info("BVN cache hit", { bvn: bvn.slice(0, 4) + "***" });
      return JSON.parse(cached);
    }

    // In production, call NIBSS BVN API
    // For now, simulate with mock data
    const data = await this.mockBvnVerification(bvn);

    // Cache result
    await redis.setex(cacheKey, this.BVN_CACHE_TTL, JSON.stringify(data));

    // Update borrower profile
    await prisma.borrowerProfile.update({
      where: { id: borrowerId },
      data: { bvn, bvnVerified: true },
    });

    logger.info("BVN verified", { borrowerId });

    return data;
  }

  static async verifyNin(nin: string, borrowerId: string): Promise<NinData> {
    const cacheKey = `nin:${nin}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      logger.info("NIN cache hit", { nin: nin.slice(0, 4) + "***" });
      return JSON.parse(cached);
    }

    // In production, call NIMC NIN API
    const data = await this.mockNinVerification(nin);

    await redis.setex(cacheKey, this.NIN_CACHE_TTL, JSON.stringify(data));

    await prisma.borrowerProfile.update({
      where: { id: borrowerId },
      data: { nin, ninVerified: true },
    });

    logger.info("NIN verified", { borrowerId });

    return data;
  }

  static async verifyBankAccount(
    accountNumber: string,
    bankCode: string
  ): Promise<{ accountName: string; accountNumber: string }> {
    // Use Paystack's resolve endpoint
    const { PaystackService } = await import("./paystack.service");

    const result = await PaystackService.resolveAccount(accountNumber, bankCode);

    return {
      accountName: result.account_name,
      accountNumber: result.account_number,
    };
  }

  static async matchBvnWithProfile(
    bvnData: BvnData,
    profile: { firstName: string; lastName: string; dateOfBirth?: Date | null }
  ): Promise<{ match: boolean; confidence: number; issues: string[] }> {
    const issues: string[] = [];
    let score = 0;

    // Name matching (case insensitive)
    const firstNameMatch =
      profile.firstName.toLowerCase() === bvnData.firstName.toLowerCase();
    const lastNameMatch =
      profile.lastName.toLowerCase() === bvnData.lastName.toLowerCase();

    if (firstNameMatch) score += 35;
    else issues.push("First name mismatch");

    if (lastNameMatch) score += 35;
    else issues.push("Last name mismatch");

    // DOB matching
    if (profile.dateOfBirth) {
      const profileDob = profile.dateOfBirth.toISOString().split("T")[0];
      if (profileDob === bvnData.dateOfBirth) score += 30;
      else issues.push("Date of birth mismatch");
    }

    return {
      match: score >= 70,
      confidence: score,
      issues,
    };
  }

  private static async mockBvnVerification(bvn: string): Promise<BvnData> {
    if (bvn.length !== 11) throw ApiError.badRequest("Invalid BVN format");

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 500));

    return {
      firstName: "John",
      lastName: "Doe",
      middleName: "Smith",
      dateOfBirth: "1990-01-15",
      phoneNumber: "08012345678",
      gender: "M",
      enrollmentBank: "First Bank",
      enrollmentBranch: "Lagos Main",
    };
  }

  private static async mockNinVerification(nin: string): Promise<NinData> {
    if (nin.length !== 11) throw ApiError.badRequest("Invalid NIN format");

    await new Promise((r) => setTimeout(r, 500));

    return {
      firstName: "John",
      lastName: "Doe",
      middleName: "Smith",
      dateOfBirth: "1990-01-15",
      gender: "M",
    };
  }
}
