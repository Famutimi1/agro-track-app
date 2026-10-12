import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
export const api = axios.create({ baseURL: API_URL, headers: { "Content-Type": "application/json" }, withCredentials: true });
let refreshRequest: Promise<unknown> | null = null;

api.interceptors.response.use(response => response, async (error: AxiosError) => {
  const request = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
  const isAuthAction = request?.url?.startsWith("/auth/") && request.url !== "/auth/me";
  if (request && error.response?.status === 401 && !request._retry && !isAuthAction) {
    request._retry = true;
    try {
      if (!refreshRequest) {
        refreshRequest = axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true }).finally(() => { refreshRequest = null; });
      }
      await refreshRequest;
      return api(request);
    } catch (refreshError) {
      if (typeof window !== "undefined") window.dispatchEvent(new Event("agrotrack:session-expired"));
      return Promise.reject(refreshError);
    }
  }
  return Promise.reject(error);
});

export interface ApiResponse<T> { success: boolean; data: T; message?: string }
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
export type ApiError = AxiosError<{ success: false; message: string }>;
