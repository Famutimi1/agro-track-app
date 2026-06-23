import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { loginLimiter, otpLimiter, registerLimiter } from "../middlewares/rate-limiter";
import {
  registerLenderSchema,
  registerBorrowerSchema,
  loginSchema,
  refreshTokenSchema,
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
authRouter.post("/refresh", validate(refreshTokenSchema), refresh);
authRouter.post("/logout", authenticate, logout);

// Profile
authRouter.get("/me", authenticate, getMe);

// OTP
authRouter.post("/otp/send", otpLimiter, sendOtp);
authRouter.post("/otp/verify", verifyOtp);

// 2FA
authRouter.post("/2fa/setup", authenticate, setup2FA);
authRouter.post("/2fa/verify", authenticate, verify2FASetup);
authRouter.post("/2fa/disable", authenticate, disable2FA);

// Password Reset
authRouter.post("/password/forgot", forgotPassword);
authRouter.post("/password/reset", resetPassword);

// Phone Verification
authRouter.post("/phone/verify", authenticate, verifyPhone);
