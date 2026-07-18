"use client";

import { type ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Auth state is automatically hydrated from localStorage by Zustand persist
  // No need to call refreshUser on every mount - tokens are validated on API calls
  // via the interceptor in client.ts which handles 401s and refreshes tokens
  return <>{children}</>;
}
