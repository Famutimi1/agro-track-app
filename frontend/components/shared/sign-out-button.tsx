"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores";
import { Button } from "@/components/ui/button";
export function SignOutButton() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  return <div className="flex items-center gap-2"><Button variant="secondary" size="sm" disabled={pending} onClick={async () => {
    setPending(true); setError(false);
    try { await logout(); router.replace("/login"); } catch { setError(true); } finally { setPending(false); }
  }}>{pending ? "Signing out…" : "Sign out"}</Button>{error && <span className="text-xs text-red-600" role="alert">Unable to sign out. Retry.</span>}</div>;
}
