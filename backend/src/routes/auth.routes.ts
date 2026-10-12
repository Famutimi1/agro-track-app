import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { loginLimiter, otpLimiter, registerLimiter } from "../middlewares/rate-limiter";
import {
  registerLenderSchema,
  registerBorrowerSchema,
  loginSchema,
  forgotPasswordSchema, resetPasswordSchema,
} from "../validators/auth.schema";
import {
  registerLender,
  registerBorrower,
  login,
  refresh,
  logout,
  getMe,
  sendOtp,
  verifyOtp,
  setup2FA,
  verify2FASetup,
  disable2FA,
  forgotPassword,
  resetPassword,
  verifyPhone,
} from "../controllers/auth.controller";

export const authRouter = Router();

// Registration
authRouter.post("/register/lender", registerLimiter, validate(registerLenderSchema), registerLender);
authRouter.post("/register/borrower", registerLimiter, validate(registerBorrowerSchema), registerBorrower);

// Login/Logout
authRouter.post("/login", loginLimiter, validate(loginSchema), login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);

// Profile
authRouter.get("/me", authenticate, getMe);

// OTP
const otpSchema = z.object({ phone: z.string().min(10).max(15), purpose: z.enum(["LOGIN", "VERIFY", "RESET"]).default("VERIFY") });
const tokenSchema = z.object({ token: z.string().regex(/^\d{6}$/) });
authRouter.post("/otp/send", otpLimiter, validate(otpSchema), sendOtp);
authRouter.post("/otp/verify", otpLimiter, validate(otpSchema.extend({ otp: z.string().regex(/^\d{6}$/) })), verifyOtp);

// 2FA
authRouter.post("/2fa/setup", authenticate, setup2FA);
authRouter.post("/2fa/verify", authenticate, otpLimiter, validate(tokenSchema), verify2FASetup);
authRouter.post("/2fa/disable", authenticate, otpLimiter, validate(tokenSchema), disable2FA);

// Password Reset
authRouter.post("/password/forgot", otpLimiter, validate(forgotPasswordSchema), forgotPassword);
authRouter.post("/password/reset", otpLimiter, validate(resetPasswordSchema), resetPassword);

// Phone Verification
authRouter.post("/phone/verify", authenticate, otpLimiter, validate(z.object({ phone: z.string().min(10).max(15), otp: z.string().regex(/^\d{6}$/) })), verifyPhone);
