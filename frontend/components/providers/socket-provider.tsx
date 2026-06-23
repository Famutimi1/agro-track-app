"use client";

import { useEffect, type ReactNode } from "react";
import { useSocket, useRealtimeInvalidation } from "@/lib/socket";
import { useAuthStore } from "@/lib/stores";

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { isAuthenticated } = useAuthStore();
  const { isConnected } = useSocket();

  useRealtimeInvalidation();

  useEffect(() => {
    if (isAuthenticated && !isConnected) {
      // Socket will auto-connect via the auth store subscription
    }
  }, [isAuthenticated, isConnected]);

  return <>{children}</>;
}
