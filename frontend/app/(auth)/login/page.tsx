"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Lock, Mail, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { roleHome } from "@/lib/stores/auth.store";
import { useAuthStore } from "@/lib/stores";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, twoFactorRequired, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) return;

    try {
      const authenticated = await login(email, password, twoFactorRequired ? code : undefined);
      if (authenticated) router.replace(roleHome(useAuthStore.getState().user!.role));
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
        <div id="login-error" role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
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

        {twoFactorRequired && <div>
          <label htmlFor="two-factor-code" className="text-xs font-semibold mb-1.5 block">Authenticator code</label>
          <Input id="two-factor-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} placeholder="6-digit code" required disabled={isLoading} />
        </div>}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--muted)]">Secure sign-in</span>
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

      <div className="mt-6 pt-5 border-t border-[var(--border)] text-center">
        <p className="text-[11px] text-[var(--muted)] mb-3">Or sign in as</p>
        <Link href="/register" className="text-xs text-brand-green font-semibold hover:underline">
          Borrower Portal →
        </Link>
      </div>
    </Card>
  );
}
