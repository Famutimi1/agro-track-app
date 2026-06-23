"use client";

import { useState } from "react";
import Link from "next/link";
import { Smartphone, MessageSquare, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const methods = [
  { id: "app", label: "Authenticator App", desc: "Use Google Authenticator or Authy", icon: Smartphone },
  { id: "sms", label: "SMS Code", desc: "We'll send a code to your phone", icon: MessageSquare },
  { id: "email", label: "Email Code", desc: "We'll send a code to your email", icon: Mail },
];

export default function TwoFactorPage() {
  const [method, setMethod] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  if (verified) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-lg font-bold text-[var(--text)] mb-2">Verified!</h2>
        <p className="text-sm text-[var(--muted)] mb-6">Two-factor authentication successful.</p>
        <Link href="/dashboard">
          <Button className="w-full">Continue to Dashboard</Button>
        </Link>
      </Card>
    );
  }

  if (method) {
    return (
      <Card className="p-8">
        <h1 className="text-xl font-bold text-[var(--text)] mb-1">Enter Code</h1>
        <p className="text-sm text-[var(--muted)] mb-6">
          Enter the 6-digit code from your {method === "app" ? "authenticator app" : method === "sms" ? "SMS" : "email"}
        </p>
        <div className="flex gap-2 justify-center mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <input
              key={i}
              maxLength={1}
              className="w-10 h-12 rounded-lg border border-[var(--border)] bg-[var(--input-bg)] text-center text-lg font-bold text-[var(--text)] outline-none focus:border-brand-green"
            />
          ))}
        </div>
        <Button className="w-full" onClick={() => setVerified(true)}>
          Verify
        </Button>
        <button
          onClick={() => setMethod(null)}
          className="w-full mt-3 text-xs text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
        >
          Choose a different method
        </button>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h1 className="text-xl font-bold text-[var(--text)] mb-1">Two-Factor Authentication</h1>
      <p className="text-sm text-[var(--muted)] mb-6">
        Choose a verification method
      </p>
      <div className="space-y-3">
        {methods.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] hover:border-brand-green/50 transition-colors cursor-pointer text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--input-bg)] flex items-center justify-center">
                <Icon size={18} className="text-brand-green" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text)]">{m.label}</p>
                <p className="text-xs text-[var(--muted)]">{m.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
