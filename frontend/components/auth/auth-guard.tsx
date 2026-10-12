"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores";

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function AuthGuard({
  children,
  allowedRoles,
  redirectTo = "/login",
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, refreshUser } = useAuthStore();

  useEffect(() => {
    // Force a server refresh so role changes (e.g. a DB/admin promotion)
    // are picked up instead of trusting the stale role from localStorage.
    refreshUser(true);
  }, [refreshUser]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`${redirectTo}?returnUrl=${returnUrl}`);
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.replace("/unauthorized");
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router, pathname, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

export function LenderGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={["LENDER_ADMIN", "LENDER_MANAGER", "LENDER_VIEWER", "LENDER_ANALYST"]}>
      {children}
    </AuthGuard>
  );
}

export function BorrowerGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={["BORROWER"]}>
      {children}
    </AuthGuard>
  );
}

export function AdminGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={["SUPER_ADMIN"]}>
      {children}
    </AuthGuard>
  );
}

export function FieldAgentGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={["FIELD_AGENT", "FIELD_SUPERVISOR"]}>
      {children}
    </AuthGuard>
  );
}
