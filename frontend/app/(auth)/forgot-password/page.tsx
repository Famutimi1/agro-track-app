"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authApi } from "@/lib/api";
import { AxiosError } from "axios";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authApi.forgotPassword(email);
      setStep(1);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Failed to send reset code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.querySelector<HTMLInputElement>(
        `input[data-index="${index + 1}"]`
      );
      nextInput?.focus();
    }
  };

  const handleVerifyCode = () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authApi.resetPassword(email, code.join(""), newPassword);
      setStep(3);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-8">
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {step === 0 && (
        <>
          <h1 className="text-xl font-bold text-[var(--text)] mb-1">Forgot Password</h1>
          <p className="text-sm text-[var(--muted)] mb-6">
            Enter your email to receive a reset code
          </p>
          <div className="space-y-4">
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <Input
                type="email"
                placeholder="you@organization.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                disabled={isLoading}
              />
            </div>
            <Button className="w-full" onClick={handleSendCode} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Code"
              )}
            </Button>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="text-xl font-bold text-[var(--text)] mb-1">Enter Code</h1>
          <p className="text-sm text-[var(--muted)] mb-6">
            We sent a 6-digit code to {email}
          </p>
          <div className="flex gap-2 justify-center mb-6">
            {code.map((digit, i) => (
              <input
                key={i}
                data-index={i}
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                className="w-10 h-12 rounded-lg border border-[var(--border)] bg-[var(--input-bg)] text-center text-lg font-bold text-[var(--text)] outline-none focus:border-brand-green"
              />
            ))}
          </div>
          <Button className="w-full" onClick={handleVerifyCode}>
            Verify Code
          </Button>
          <button
            onClick={handleSendCode}
            className="w-full mt-3 text-xs text-[var(--muted)] hover:text-brand-green"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Resend code"}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="text-xl font-bold text-[var(--text)] mb-1">New Password</h1>
          <p className="text-sm text-[var(--muted)] mb-6">
            Create a new password for your account
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">New Password</label>
              <Input
                type="password"
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Confirm Password</label>
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button className="w-full" onClick={handleResetPassword} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </div>
        </>
      )}

      {step === 3 && (
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h3 className="text-base font-bold text-[var(--text)] mb-2">Password Reset!</h3>
          <p className="text-sm text-[var(--muted)] mb-6">
            Your password has been successfully reset.
          </p>
          <Link href="/login">
            <Button className="w-full">Back to Login</Button>
          </Link>
        </div>
      )}

      {step < 3 && (
        <div className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--text)]">
            <ArrowLeft size={12} /> Back to login
          </Link>
        </div>
      )}
    </Card>
  );
}
