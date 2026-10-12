import { create } from "zustand";
import { User, authApi } from "../api";
import { AxiosError } from "axios";

export function roleHome(role: string): string {
  if (role === "SUPER_ADMIN") return "/admin-overview";
  if (["FIELD_AGENT", "FIELD_SUPERVISOR"].includes(role)) return "/agent/dashboard";
  if (role === "BORROWER") return "/borrower-overview";
  if (role.startsWith("LENDER_")) return "/dashboard";
  return "/unauthorized";
}
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  twoFactorRequired: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string, twoFactorToken?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}
let profileRequest: Promise<void> | null = null;
export const useAuthStore = create<AuthState>()((set) => ({
  user: null, isAuthenticated: false, isLoading: true, twoFactorRequired: false, error: null,
  setUser: user => set({ user, isAuthenticated: !!user, isLoading: false }),
  login: async (email, password, twoFactorToken) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authApi.login({ email, password, twoFactorToken });
      if ("requires2FA" in result && result.requires2FA) {
        set({ user: null, isAuthenticated: false, twoFactorRequired: true, isLoading: false });
        return false;
      }
      if (!("user" in result) || !result.user) throw new Error("Invalid login response");
      const user = await authApi.getProfile();
      set({ user, isAuthenticated: true, twoFactorRequired: false, isLoading: false, error: null });
      return true;
    } catch (err) {
      set({ user: null, isAuthenticated: false, error: (err as AxiosError<{ message?: string }>).response?.data?.message || "Unable to sign in", isLoading: false });
      throw err;
    }
  },
  logout: async () => {
    // Do not claim logout succeeded until the server has revoked the session.
    await authApi.logout();
    set({ user: null, isAuthenticated: false, isLoading: false, twoFactorRequired: false, error: null });
  },
  refreshUser: () => {
    if (profileRequest) return profileRequest;
    profileRequest = (async () => {
      try {
        const user = await authApi.getProfile();
        set({ user, isAuthenticated: true, isLoading: false });
      } catch { set({ user: null, isAuthenticated: false, isLoading: false }); }
    })().finally(() => { profileRequest = null; });
    return profileRequest;
  },
  clearError: () => set({ error: null }),
}));
