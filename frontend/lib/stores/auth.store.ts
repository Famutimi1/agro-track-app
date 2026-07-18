import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, authApi, UpdateProfileRequest } from "../api";
import { AxiosError } from "axios";

const isBrowser = typeof window !== "undefined";

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null;
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (!isBrowser) return;
    localStorage.setItem(key, value);
  },
  removeItem: (key: string): void => {
    if (!isBrowser) return;
    localStorage.removeItem(key);
  },
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: (forceRefresh?: boolean) => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, accessToken, refreshToken } = await authApi.login({ email, password });
          safeLocalStorage.setItem("accessToken", accessToken);
          safeLocalStorage.setItem("refreshToken", refreshToken);
          set({ user, isAuthenticated: true, isLoading: false, error: null });
        } catch (err) {
          const axiosError = err as AxiosError<{ message?: string }>;
          const message = axiosError.response?.data?.message || "Login failed";
          set({
            error: message,
            isLoading: false,
          });
          throw err;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Ignore logout API errors
        } finally {
          safeLocalStorage.removeItem("accessToken");
          safeLocalStorage.removeItem("refreshToken");
          set({ user: null, isAuthenticated: false, error: null });
        }
      },

      refreshUser: async (forceRefresh = false) => {
        const token = safeLocalStorage.getItem("accessToken");
        if (!token) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        // Skip API call if user already exists (from hydration) unless forced
        const { user, isAuthenticated } = get();
        if (!forceRefresh && user && isAuthenticated) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const user = await authApi.getProfile();
          set({ user, isAuthenticated: true, isLoading: false, error: null });
        } catch (err) {
          const axiosError = err as AxiosError<{ message?: string }>;
          const message = axiosError.response?.data?.message || "Session expired";
          safeLocalStorage.removeItem("accessToken");
          safeLocalStorage.removeItem("refreshToken");
          set({ user: null, isAuthenticated: false, isLoading: false, error: message });
        }
      },

      clearError: () => set({ error: null }),

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authApi.updateProfile(data);
          set({ user, isAuthenticated: true, isLoading: false, error: null });
        } catch (err) {
          const axiosError = err as AxiosError<{ message?: string }>;
          const message = axiosError.response?.data?.message || "Failed to update profile";
          set({ error: message, isLoading: false });
          throw err;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => (isBrowser ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Auth hydration failed:", error);
          return;
        }
        // After hydration, just set isLoading to false
        // The user/isAuthenticated are already restored from localStorage
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);
