"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/lib/stores";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { refreshUser, isLoading } = useAuthStore();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return <>{children}</>;
}
