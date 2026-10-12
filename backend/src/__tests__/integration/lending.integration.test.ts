import request from "supertest";
import http from "http";
import jwt from "jsonwebtoken";
import { generate, generateSecret } from "otplib";
import { app } from "../../app";
import { prisma } from "../../config/prisma";
import { AuthService } from "../../services/auth.service";
import { env } from "../../config/env";
import { Role } from "@prisma/client";
import { REFRESH_COOKIE } from "../../utils/session-cookies";

const integration = process.env.AGROTRACK_INTEGRATION === "1" ? describe : describe.skip;
const origin = new URL(env.FRONTEND_URL).origin;
const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });
integration("Authentication and lending HTTP integration", () => {
  const server = http.createServer(app);
  let lenderId: string, lenderBId: string, borrowerId: string, borrowerBId: string;
  let lenderToken: string, lenderBToken: string, borrowerToken: string, borrowerBToken: string;
  let programId: string, applicationId: string, loanId: string;
  let lenderUserId: string;
  beforeAll(async () => {
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    const passwordHash = await AuthService.hashPassword("testPassword123!");
    const a = await prisma.lenderOrganization.create({ data: { name: "Integration lender A", type: "Bank", email: "org-a@example.test" } });
    const b = await prisma.lenderOrganization.create({ data: { name: "Integration lender B", type: "Bank", email: "org-b@example.test" } });
    lenderId = a.id; lenderBId = b.id;
    const create = (email: string, role: Role, lenderOrgId?: string) => prisma.user.create({ data: { email, passwordHash, firstName: "Test", lastName: "User", role, lenderOrgId } });
    const lender = await create("lender-a@example.test", "LENDER_ADMIN", a.id);
    const other = await create("lender-b@example.test", "LENDER_ADMIN", b.id);
    const farmer = await create("farmer-a@example.test", "BORROWER");
    const farmerB = await create("farmer-b@example.test", "BORROWER");
    lenderUserId = lender.id;
    borrowerId = (await prisma.borrowerProfile.create({ data: { userId: farmer.id, farmerId: "TEST-A", state: "Lagos", lga: "Ikeja", farmSizeHa: 2, primaryCrop: "Cassava", farmScore: 700 } })).id;
    borrowerBId = (await prisma.borrowerProfile.create({ data: { userId: farmerB.id, farmerId: "TEST-B", state: "Lagos", lga: "Ikeja", farmSizeHa: 2, primaryCrop: "Cassava", farmScore: 700 } })).id;
    lenderToken = (await AuthService.issueSession(lender)).accessToken;
    lenderBToken = (await AuthService.issueSession(other)).accessToken;
    borrowerToken = (await AuthService.issueSession(farmer)).accessToken;
    borrowerBToken = (await AuthService.issueSession(farmerB)).accessToken;
    programId = (await prisma.program.create({ data: { lenderOrgId: a.id, name: "Integration program", description: "Test lending program", status: "ACTIVE", minAmount: 100, maxAmount: 500000, interestRate: 10, durationMonths: 3, trancheCount: 3, requiredScore: 500, targetStates: [], targetCrops: [] } })).id;
  });
  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    await prisma.$disconnect();
  });

  it("issues HttpOnly cookies and stores only hashed refresh credentials", async () => {
    const res = await request(server).post("/api/auth/login").set("Origin", origin).send({ email: "lender-a@example.test", password: "testPassword123!" });
    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe("LENDER_ADMIN");
    expect(res.body.data.accessToken).toBeUndefined(); expect(res.body.data.refreshToken).toBeUndefined();
    const cookies = res.headers["set-cookie"] as unknown as string[];
    expect(cookies.every(c => c.includes("HttpOnly") && c.includes("SameSite=Strict"))).toBe(true);
    const rawRefresh = cookies.find(c => c.startsWith(REFRESH_COOKIE + "="))!.split(";")[0].split("=")[1];
    expect(await prisma.refreshToken.findUnique({ where: { token: rawRefresh } })).toBeNull();
    expect(await prisma.refreshToken.findUnique({ where: { token: AuthService.hashToken(rawRefresh) } })).not.toBeNull();
    const me = await request(server).get("/api/auth/me").set("Cookie", cookies.map(c => c.split(";")[0]));
    expect(me.status).toBe(200);
    const revoked = await request(server).post("/api/auth/logout").set("Origin", origin).set("Cookie", cookies.map(c => c.split(";")[0]));
    expect(revoked.status).toBe(200);
    expect((await request(server).get("/api/auth/me").set("Cookie", cookies.map(c => c.split(";")[0]))).status).toBe(401);
  });
  it("rotates refresh tokens once and rejects replay", async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: lenderUserId } });
    const session = await AuthService.issueSession(user);
    const cookie = `${REFRESH_COOKIE}=${session.refreshToken}`;
    expect((await request(server).post("/api/auth/refresh").set("Origin", origin).set("Cookie", cookie).send({})).status).toBe(200);
    expect((await request(server).post("/api/auth/refresh").set("Origin", origin).set("Cookie", cookie).send({})).status).toBe(401);
  });
  it("rejects cross-origin cookie writes and unbound JWTs", async () => {
    const session = await AuthService.issueSession(await prisma.user.findUniqueOrThrow({ where: { id: lenderUserId } }));
    const blocked = await request(server).post("/api/auth/logout").set("Origin", "https://untrusted.example").set("Cookie", `${REFRESH_COOKIE}=${session.refreshToken}`);
    expect(blocked.status).toBe(403);
    const unbound = jwt.sign({ sub: lenderUserId, role: "SUPER_ADMIN" }, env.JWT_SECRET);
    expect((await request(server).get("/api/auth/me").set(bearer(unbound))).status).toBe(401);
  });
  it("rejects inactive users even with a valid signed session token", async () => {
    await prisma.user.update({ where: { id: lenderUserId }, data: { isActive: false } });
    expect((await request(server).get("/api/auth/me").set(bearer(lenderToken))).status).toBe(401);
    await prisma.user.update({ where: { id: lenderUserId }, data: { isActive: true } });
  });
  it("does not issue a session until a real TOTP challenge succeeds", async () => {
    const secret = generateSecret();
    const user = await prisma.user.create({ data: { email: "totp@example.test", passwordHash: await AuthService.hashPassword("testPassword123!"), role: "BORROWER", firstName: "TOTP", lastName: "User", twoFactorEnabled: true, twoFactorSecret: secret } });
    const challenge = await request(server).post("/api/auth/login").set("X-Forwarded-For", "127.0.0.2").send({ email: user.email, password: "testPassword123!" });
    expect(challenge.status).toBe(200); expect(challenge.body.data.requires2FA).toBe(true); expect(challenge.headers["set-cookie"]).toBeUndefined();
    expect((await request(server).post("/api/auth/login").send({ email: user.email, password: "testPassword123!", twoFactorToken: "000000" })).status).toBe(401);
    const token = await generate({ secret });
    const success = await request(server).post("/api/auth/login").send({ email: user.email, password: "testPassword123!", twoFactorToken: token });
    expect(success.status).toBe(200); expect(success.body.data.user.id).toBe(user.id);
  });
  it("does not persist authentication credentials in audit logs", async () => {
    const logs = await prisma.auditLog.findMany({ where: { action: { startsWith: "POST /api/auth/" } } });
    expect(logs.length).toBeGreaterThan(0);
    expect(JSON.stringify(logs)).not.toContain("testPassword123!");
    expect(logs.every(log => log.details === null)).toBe(true);
  });
  it("requires provider authentication for external callbacks", async () => {
    expect((await request(server).post("/api/whatsapp/webhook").send({ entry: [] })).status).toBe(401);
    expect([401, 503]).toContain((await request(server).post("/api/ussd/callback").send({ sessionId: "invalid", phoneNumber: "08000000000" })).status);
  });
  it("scopes cooperative and program-report access to the lender", async () => {
    const coop = await prisma.cooperative.create({ data: { name: "Tenant A group", state: "Lagos", lenderOrgId: lenderId } });
    expect((await request(server).get(`/api/cooperatives/${coop.id}`).set(bearer(lenderBToken))).status).toBe(404);
    expect((await request(server).patch(`/api/cooperatives/${coop.id}`).set(bearer(lenderBToken)).send({ name: "Unauthorized edit" })).status).toBe(404);
    expect((await request(server).get(`/api/cooperatives/${coop.id}`).set(bearer(lenderToken))).status).toBe(200);
    expect((await request(server).get(`/api/reports/program/${programId}`).set(bearer(lenderBToken))).status).toBe(404);
  });
  it("rejects invalid creation and repayment input without accepting a false success", async () => {
    expect((await request(server).post("/api/applications").set(bearer(borrowerToken)).send({ programId, amount: -1 })).status).toBe(400);
    expect((await request(server).get("/api/borrowers/loans?status=INVALID").set(bearer(lenderToken))).status).toBe(400);
  });
  it("validates structured request bodies and persists a submitted application", async () => {
    const res = await request(server).post("/api/applications").set(bearer(borrowerToken)).send({ programId, amount: 1000.01, purpose: "Purchase planting materials" });
    expect(res.status).toBe(201); applicationId = res.body.data.id;
    expect((await request(server).patch(`/api/applications/${applicationId}/submit`).set(bearer(borrowerToken))).status).toBe(200);
    expect((await request(server).get(`/api/applications/${applicationId}`).set(bearer(borrowerToken))).body.data.status).toBe("SUBMITTED");
  });
  it("enforces target crops and rechecks program availability when submitting a saved draft", async () => {
    const program = await prisma.program.create({ data: { lenderOrgId: lenderId, name: "Rice only", description: "A targeted rice program", minAmount: 100, maxAmount: 1000, interestRate: 1, durationMonths: 3, status: "ACTIVE", targetCrops: ["Rice"], targetStates: ["Lagos"] } });
    expect((await request(server).post("/api/applications").set(bearer(borrowerToken)).send({ programId: program.id, amount: 500, purpose: "Purchase new farm inputs" })).status).toBe(400);
    const draft = await prisma.application.create({ data: { programId, borrowerId: borrowerBId, amount: 500, status: "DRAFT" } });
    await prisma.program.update({ where: { id: programId }, data: { status: "PAUSED" } });
    expect((await request(server).patch(`/api/applications/${draft.id}/submit`).set(bearer(borrowerBToken))).status).toBe(400);
    expect((await prisma.application.findUniqueOrThrow({ where: { id: draft.id } })).status).toBe("DRAFT");
    await prisma.program.update({ where: { id: programId }, data: { status: "ACTIVE" } });
  });
  it("denies another borrower or lender access to the application", async () => {
    for (const token of [borrowerBToken, lenderBToken]) expect((await request(server).get(`/api/applications/${applicationId}`).set(bearer(token))).status).toBe(404);
    expect((await request(server).patch(`/api/applications/${applicationId}/review`).set(bearer(lenderBToken)).send({ status: "APPROVED" })).status).toBe(404);
    expect((await request(server).patch(`/api/applications/${applicationId}/under-review`).set(bearer(lenderBToken))).status).toBe(404);
  });
  it("makes concurrent approvals create exactly one loan, with exact tranche and repayment sums", async () => {
    const responses = await Promise.all([1, 2].map(() => request(server).patch(`/api/applications/${applicationId}/review`).set(bearer(lenderToken)).send({ status: "APPROVED" })));
    expect(responses.map(r => r.status).sort()).toEqual([200, 409]);
    const loans = await prisma.borrowerLoan.findMany({ where: { applicationId }, include: { disbursements: true, repayments: true } });
    expect(loans).toHaveLength(1); const loan = loans[0]; loanId = loan.id;
    expect(loan.disbursements).toHaveLength(3); expect(loan.repayments).toHaveLength(3);
    expect(loan.disbursements.reduce((s, d) => s + Math.round(Number(d.amount) * 100), 0)).toBe(100001);
    expect(loan.repayments.reduce((s, r) => s + Math.round(Number(r.amount) * 100), 0)).toBe(Math.round(Number(loan.totalRepayable) * 100));
  });
  it("rolls back application approval when invalid program settings prevent loan creation", async () => {
    const invalidProgram = await prisma.program.create({ data: { lenderOrgId: lenderId, name: "Invalid program", description: "Invalid configuration", minAmount: 100, maxAmount: 1000, interestRate: 1, durationMonths: 0, status: "ACTIVE", targetCrops: [], targetStates: [] } });
    const appRecord = await prisma.application.create({ data: { borrowerId, programId: invalidProgram.id, amount: 500, status: "SUBMITTED" } });
    expect((await request(server).patch(`/api/applications/${appRecord.id}/review`).set(bearer(lenderToken)).send({ status: "APPROVED" })).status).toBe(400);
    expect((await prisma.application.findUniqueOrThrow({ where: { id: appRecord.id } })).status).toBe("SUBMITTED");
  });
  it("scopes loan reads, disbursement approval, and repayments to the owner", async () => {
    for (const token of [borrowerBToken, lenderBToken]) expect((await request(server).get(`/api/borrowers/loans/${loanId}`).set(bearer(token))).status).toBe(404);
    expect((await request(server).get(`/api/borrowers/loans/${loanId}`).set(bearer(borrowerToken))).status).toBe(200);
    const tranche = await prisma.disbursement.findFirstOrThrow({ where: { loanId, trancheNumber: 1 } });
    expect((await request(server).patch(`/api/disbursements/${tranche.id}/approve`).set(bearer(lenderBToken)).send({})).status).toBe(404);
    const repayment = await prisma.repayment.findFirstOrThrow({ where: { loanId } });
    expect((await request(server).patch(`/api/repayments/${repayment.id}/pay`).set(bearer(lenderBToken)).send({ amount: 1, method: "CASH", paymentRef: "tenant-denied" })).status).toBe(404);
  });
  it("requires current verified farm evidence before approving another tranche", async () => {
    await prisma.borrowerLoan.update({ where: { id: loanId }, data: { status: "ACTIVE" } });
    const first = await prisma.disbursement.findFirstOrThrow({ where: { loanId, trancheNumber: 1 } });
    const second = await prisma.disbursement.findFirstOrThrow({ where: { loanId, trancheNumber: 2 } });
    const processedAt = new Date(Date.now() - 1000);
    await prisma.disbursement.update({ where: { id: first.id }, data: { status: "COMPLETED", processedAt } });
    expect((await request(server).patch(`/api/disbursements/${second.id}/approve`).set(bearer(lenderToken)).send({})).status).toBe(400);
    await prisma.farmReport.create({ data: { borrowerId, type: "PROGRESS", title: "New verified report", status: "VERIFIED", verifiedAt: new Date(), images: [] } });
    expect((await request(server).patch(`/api/disbursements/${second.id}/approve`).set(bearer(lenderToken)).send({})).status).toBe(200);
  });
  it("accumulates partial repayments, makes retries idempotent, and rejects overpayments", async () => {
    const installment = await prisma.repayment.findFirstOrThrow({ where: { loanId }, orderBy: { dueDate: "asc" } });
    const pay = (amount: number, paymentRef: string) => request(server).patch(`/api/repayments/${installment.id}/pay`).set(bearer(lenderToken)).send({ amount, method: "BANK_TRANSFER", paymentRef });
    const partial = await pay(100, "partial-payment-1"); expect(partial.status).toBe(200); expect(partial.body.data.status).toBe("PARTIAL");
    expect((await pay(100, "partial-payment-1")).status).toBe(200);
    expect(Number((await prisma.borrowerLoan.findUniqueOrThrow({ where: { id: loanId } })).amountPaid)).toBe(100);
    expect((await pay(10000, "overpayment-ref")).status).toBe(400);
    const remaining = Number(installment.amount) - 100;
    expect((await pay(remaining, "partial-payment-2")).body.data.status).toBe("PAID");
    expect(Number((await prisma.borrowerLoan.findUniqueOrThrow({ where: { id: loanId } })).amountPaid)).toBe(Number(installment.amount));
    expect(await prisma.transaction.count({ where: { loanId, type: "REPAYMENT" } })).toBe(2);
  });
});
