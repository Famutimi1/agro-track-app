import { Express } from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { User, Role, LenderOrganization, BorrowerProfile } from "@prisma/client";
import { prisma } from "../setup";

export interface TestUser {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TestLender {
  organization: LenderOrganization;
  admin: TestUser;
}

export interface TestBorrower {
  borrower: BorrowerProfile;
  user: TestUser;
}

export function generateTestToken(userId: string, role: Role, lenderId?: string): string {
  return jwt.sign(
    { userId, role, lenderId },
    process.env.JWT_SECRET as string,
    { expiresIn: "15m" }
  );
}

export function generateTestRefreshToken(userId: string): string {
  return jwt.sign(
    { userId, type: "refresh" },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "7d" }
  );
}

export async function createTestUser(
  overrides: Partial<Omit<User, "id" | "createdAt" | "updatedAt">> = {},
  role: Role = "BORROWER"
): Promise<TestUser> {
  const email = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: "$2b$10$test-hash-for-testing-purposes",
      firstName: "Test",
      lastName: "User",
      role,
      emailVerified: true,
      ...overrides,
    },
  });

  const accessToken = generateTestToken(user.id, user.role);
  const refreshToken = generateTestRefreshToken(user.id);

  return { user, accessToken, refreshToken };
}

export async function createTestLender(): Promise<TestLender> {
  const organization = await prisma.lenderOrganization.create({
    data: {
      name: `Test Lender ${Date.now()}`,
      type: "MICROFINANCE",
      email: `lender-${Date.now()}@example.com`,
      status: "ACTIVE",
      plan: "STARTER",
      verified: true,
    },
  });

  const adminUser = await createTestUser(
    { lenderOrgId: organization.id },
    "LENDER_ADMIN"
  );

  return { organization, admin: adminUser };
}

export async function createTestBorrower(): Promise<TestBorrower> {
  const userResult = await createTestUser({}, "BORROWER");

  const borrower = await prisma.borrowerProfile.create({
    data: {
      userId: userResult.user.id,
      farmerId: `FRM-${Date.now()}`,
      state: "KN",
      lga: "Kano Municipal",
      farmSizeHa: 2.5,
      primaryCrop: "maize",
      farmScore: 650,
      farmScoreTier: "GOOD",
    },
  });

  return { borrower, user: userResult };
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

export async function cleanupTestData(): Promise<void> {
  const deleteInOrder = [
    prisma.auditLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.farmReport.deleteMany(),
    prisma.farmScoreHistory.deleteMany(),
    prisma.repayment.deleteMany(),
    prisma.disbursement.deleteMany(),
    prisma.document.deleteMany(),
    prisma.fieldVisit.deleteMany(),
    prisma.fieldAgentProfile.deleteMany(),
    prisma.application.deleteMany(),
    prisma.borrowerLoan.deleteMany(),
    prisma.program.deleteMany(),
    prisma.borrowerProfile.deleteMany(),
    prisma.cooperative.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.user.deleteMany({ where: { email: { contains: "test-" } } }),
    prisma.lenderOrganization.deleteMany({ where: { name: { contains: "Test Lender" } } }),
  ];

  for (const deletion of deleteInOrder) {
    try {
      await deletion;
    } catch {
      // Ignore errors during cleanup
    }
  }
}

export function apiRequest(app: Express) {
  return {
    get: (url: string) => request(app).get(url),
    post: (url: string) => request(app).post(url),
    put: (url: string) => request(app).put(url),
    patch: (url: string) => request(app).patch(url),
    delete: (url: string) => request(app).delete(url),
  };
}
