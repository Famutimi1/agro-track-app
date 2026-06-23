import { api, ApiResponse } from "./client";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  avatarUrl?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  lenderOrg?: { id: string; name: string; plan: string };
  borrowerProfile?: {
    farmerId: string;
    farmScore: number;
    farmScoreTier: string;
    state: string;
    primaryCrop: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorToken?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  requires2FA?: boolean;
}

export interface RegisterLenderRequest {
  organizationName: string;
  organizationType: string;
  cacNumber?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterBorrowerRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
  bvn?: string;
  nin?: string;
  state: string;
  lga: string;
  farmSizeHa: number;
  primaryCrop: string;
  bankName?: string;
  bankAccount?: string;
  language?: string;
}

export type RegisterRequest = RegisterLenderRequest | RegisterBorrowerRequest;

export const authApi = {
  login: async (data: LoginRequest) => {
    const res = await api.post<ApiResponse<LoginResponse>>("/auth/login", data);
    return res.data.data;
  },

  registerLender: async (data: RegisterLenderRequest) => {
    const res = await api.post<ApiResponse<LoginResponse>>("/auth/register/lender", data);
    return res.data.data;
  },

  registerBorrower: async (data: RegisterBorrowerRequest) => {
    const res = await api.post<ApiResponse<LoginResponse>>("/auth/register/borrower", data);
    return res.data.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    await api.post("/auth/logout", { refreshToken });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  getMe: async () => {
    const res = await api.get<ApiResponse<User>>("/auth/me");
    return res.data.data;
  },

  getProfile: async () => {
    const res = await api.get<ApiResponse<User>>("/auth/me");
    return res.data.data;
  },

  sendOtp: async (phone: string, purpose: "LOGIN" | "VERIFY" | "RESET" = "VERIFY") => {
    const res = await api.post<ApiResponse<{ message: string }>>("/auth/otp/send", { phone, purpose });
    return res.data;
  },

  verifyOtp: async (phone: string, otp: string, purpose: "LOGIN" | "VERIFY" | "RESET" = "VERIFY") => {
    const res = await api.post<ApiResponse<{ message: string }>>("/auth/otp/verify", { phone, otp, purpose });
    return res.data;
  },

  setup2FA: async () => {
    const res = await api.post<ApiResponse<{ secret: string; qrCode: string }>>("/auth/2fa/setup");
    return res.data.data;
  },

  verify2FASetup: async (token: string) => {
    const res = await api.post<ApiResponse<{ message: string }>>("/auth/2fa/verify", { token });
    return res.data;
  },

  disable2FA: async (token: string) => {
    const res = await api.post<ApiResponse<{ message: string }>>("/auth/2fa/disable", { token });
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await api.post<ApiResponse<{ message: string }>>("/auth/password/forgot", { email });
    return res.data;
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    const res = await api.post<ApiResponse<{ message: string }>>("/auth/password/reset", {
      email,
      code,
      newPassword,
    });
    return res.data;
  },

  verifyPhone: async (phone: string, otp: string) => {
    const res = await api.post<ApiResponse<{ message: string }>>("/auth/phone/verify", { phone, otp });
    return res.data;
  },
};
