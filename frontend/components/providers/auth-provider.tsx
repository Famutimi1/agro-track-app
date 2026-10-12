"use client";

import { useEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useAuthStore } from "@/lib/stores";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { refreshUser, user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const previousUser = useRef<string | undefined>(undefined);

  useEffect(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("auth-storage");
    if ("caches" in window) {
      void caches.delete("api-cache");
      void caches.delete("image-cache");
    }
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const expire = () => setUser(null);
    window.addEventListener("agrotrack:session-expired", expire);
    return () => window.removeEventListener("agrotrack:session-expired", expire);
  }, [setUser]);
  useEffect(() => {
    if (previousUser.current !== user?.id) queryClient.clear();
    previousUser.current = user?.id;
  }, [user?.id, queryClient]);
  return <>{children}</>;
}
