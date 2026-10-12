"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Lock, Mail, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/lib/stores";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) return;

    try {
      await login(email, password);
      const { user } = useAuthStore.getState();
      const role = user?.role ?? "";

      if (role === "BORROWER") {
        router.push("/borrower/overview");
      } else if (["FIELD_AGENT", "FIELD_SUPERVISOR"].includes(role)) {
        router.push("/agent/dashboard");
      } else if (role === "SUPER_ADMIN") {
        router.push("/admin/overview");
      } else {
        // All lender roles
        router.push("/lender/dashboard");
      }
    } catch {
      // Error is handled in store
    }
  };

  return (
    <Card className="p-8">
      <h1 className="text-xl font-bold text-[var(--text)] mb-1">Welcome back</h1>
      <p className="text-sm text-[var(--muted)] mb-6">
        Sign in to your AgroTrack account
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="text-xs font-semibold text-[var(--text)] mb-1.5 block">
            Email Address
          </label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <Input
              id="email"
              type="email"
              placeholder="you@organization.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              required
              disabled={isLoading}
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="text-xs font-semibold text-[var(--text)] mb-1.5 block">
            Password
          </label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 pr-9"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <Eye size={15} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-[var(--muted)] cursor-pointer">
            <input type="checkbox" className="rounded" />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-xs text-brand-green font-semibold hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-[var(--muted)]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-brand-green font-semibold hover:underline">
            Create account
          </Link>
        </p>
      </div>

      <div className="mt-6 pt-5 border-t border-[var(--border)] text-center space-y-2">
        <p className="text-[11px] text-[var(--muted)]">New to AgroTrack?</p>
        <div className="flex justify-center gap-4 text-xs">
          <Link href="/signup" className="text-brand-green font-semibold hover:underline">
            Register as Lender →
          </Link>
          <span className="text-[var(--muted)]">|</span>
          <Link href="/register" className="text-brand-green font-semibold hover:underline">
            Register as Borrower →
          </Link>
        </div>
      </div>
    </Card>
  );
}
