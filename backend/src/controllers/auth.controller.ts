import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AuthService } from "../services/auth.service";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";

export const registerLender = asyncHandler(async (req: Request, res: Response) => {
  const { organizationName, organizationType, cacNumber, firstName, lastName, email, phone, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict("Email already registered");

  const passwordHash = await AuthService.hashPassword(password);

  const result = await prisma.$transaction(async (tx) => {
    const org = await tx.lenderOrganization.create({
      data: {
        name: organizationName,
        type: organizationType,
        cacNumber,
        email,
        phone,
      },
    });

    const user = await tx.user.create({
      data: {
        email,
        phone,
        passwordHash,
        firstName,
        lastName,
        role: "LENDER_ADMIN",
        lenderOrgId: org.id,
      },
    });

    return { user, org };
  });

  const accessToken = AuthService.generateAccessToken({
    sub: result.user.id,
    email: result.user.email,
    role: result.user.role,
    lenderId: result.org.id,
  });
  const refreshToken = await AuthService.createRefreshToken(result.user.id);

  res.status(201).json({
    success: true,
    data: {
      user: { id: result.user.id, email: result.user.email, firstName, lastName, role: result.user.role },
      organization: { id: result.org.id, name: result.org.name },
      accessToken,
      refreshToken,
    },
  });
});

export const registerBorrower = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, phone, email, password, bvn, nin, state, lga, farmSizeHa, primaryCrop, bankName, bankAccount, language } = req.body;

  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw ApiError.conflict("Email already registered");
  }

  const passwordHash = await AuthService.hashPassword(password);
  const farmerId = AuthService.generateFarmerId();

  const user = await prisma.user.create({
    data: {
      email: email || `${phone}@agrotrack.local`,
      phone,
      passwordHash,
      firstName,
      lastName,
      role: "BORROWER",
      borrowerProfile: {
        create: {
          farmerId,
          bvn,
          nin,
          state,
          lga,
          farmSizeHa,
          primaryCrop,
          bankName,
          bankAccount,
          language,
        },
      },
    },
    include: { borrowerProfile: true },
  });

  const accessToken = AuthService.generateAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = await AuthService.createRefreshToken(user.id);

  res.status(201).json({
    success: true,
    data: {
      user: { id: user.id, email: user.email, firstName, lastName, role: user.role, farmerId },
      accessToken,
      refreshToken,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, twoFactorToken } = req.body;

  await AuthService.checkLoginAttempts(email);

  const user = await prisma.user.findUnique({
    where: { email },
    include: { lenderOrg: true },
  });

  if (!user || !user.isActive) {
    await AuthService.recordFailedLogin(email);
    throw ApiError.unauthorized("Invalid email or password");
  }

  const valid = await AuthService.comparePassword(password, user.passwordHash);
  if (!valid) {
    await AuthService.recordFailedLogin(email);
    throw ApiError.unauthorized("Invalid email or password");
  }

  // Check 2FA if enabled
  if (user.twoFactorEnabled) {
    if (!twoFactorToken) {
      return res.json({
        success: true,
        data: { requires2FA: true, message: "Please provide 2FA code" },
      });
    }

    const valid2FA = await AuthService.verify2FAToken(user.id, twoFactorToken);
    if (!valid2FA) {
      throw ApiError.unauthorized("Invalid 2FA code");
    }
  }

  await AuthService.clearLoginAttempts(email);
  await AuthService.updateLastLogin(user.id, req.ip);

  const accessToken = AuthService.generateAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    lenderId: user.lenderOrgId || undefined,
  });
  const refreshToken = await AuthService.createRefreshToken(user.id);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        lenderId: user.lenderOrgId,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      accessToken,
      refreshToken,
    },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const user = await AuthService.validateRefreshToken(refreshToken);
  await AuthService.revokeRefreshToken(refreshToken);

  const newAccessToken = AuthService.generateAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    lenderId: user.lenderOrgId || undefined,
  });
  const newRefreshToken = await AuthService.createRefreshToken(user.id);

  res.json({
    success: true,
    data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await AuthService.revokeRefreshToken(refreshToken);
  }
  res.json({ success: true, message: "Logged out" });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      avatarUrl: true,
      emailVerified: true,
      phoneVerified: true,
      twoFactorEnabled: true,
      createdAt: true,
      lenderOrg: { select: { id: true, name: true, plan: true } },
      borrowerProfile: { select: { farmerId: true, farmScore: true, farmScoreTier: true, state: true, primaryCrop: true } },
    },
  });

  if (!user) throw ApiError.notFound("User not found");

  res.json({ success: true, data: user });
});

// OTP endpoints
export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { phone, purpose } = req.body;

  await AuthService.sendOtp(phone, purpose || "VERIFY");

  res.json({ success: true, message: "OTP sent" });
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { phone, otp, purpose } = req.body;

  const valid = await AuthService.verifyOtp(phone, otp, purpose || "VERIFY");
  if (!valid) throw ApiError.badRequest("Invalid or expired OTP");

  res.json({ success: true, message: "OTP verified" });
});

// 2FA endpoints
export const setup2FA = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.setup2FA(req.user!.sub);

  res.json({ success: true, data: result });
});

export const verify2FASetup = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  await AuthService.verify2FASetup(req.user!.sub, token);

  res.json({ success: true, message: "2FA enabled successfully" });
});

export const disable2FA = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  await AuthService.disable2FA(req.user!.sub, token);

  res.json({ success: true, message: "2FA disabled" });
});

// Password reset endpoints
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  await AuthService.initiatePasswordReset(email);

  res.json({ success: true, message: "If your email is registered, you will receive a reset code" });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;

  await AuthService.resetPassword(email, code, newPassword);

  res.json({ success: true, message: "Password reset successful" });
});

// Phone verification
export const verifyPhone = asyncHandler(async (req: Request, res: Response) => {
  const { phone, otp } = req.body;

  await AuthService.verifyPhone(req.user!.sub, phone, otp);

  res.json({ success: true, message: "Phone verified" });
});
