"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { useVerifyCardPaymentByReference } from "@/lib/hooks";

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={null}>
      <PaymentCallbackContent />
    </Suspense>
  );
}

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const verify = useVerifyCardPaymentByReference();
  const attempted = useRef(false);
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");

  useEffect(() => {
    if (!reference || attempted.current) return;
    attempted.current = true;

    verify.mutate(reference, {
      onSuccess: () => setStatus("success"),
      onError: () => setStatus("error"),
    });
  }, [reference]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-6">
      <Card className="w-[420px] max-w-full text-center py-10">
        {!reference && (
          <>
            <div className="w-14 h-14 mx-auto bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <X size={24} className="text-red-600" />
            </div>
            <h1 className="text-lg font-bold text-[var(--text)] mb-1">Missing Payment Reference</h1>
            <p className="text-xs text-[var(--muted)] mb-5">
              We couldn&apos;t find a payment reference in this link.
            </p>
          </>
        )}

        {reference && status === "pending" && (
          <>
            <Loader2 size={32} className="mx-auto text-brand-green animate-spin mb-4" />
            <h1 className="text-lg font-bold text-[var(--text)] mb-1">Verifying Payment…</h1>
            <p className="text-xs text-[var(--muted)] mb-5">Please wait while we confirm your payment.</p>
          </>
        )}

        {reference && status === "success" && (
          <>
            <div className="w-14 h-14 mx-auto bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <Check size={24} className="text-green-600" />
            </div>
            <h1 className="text-lg font-bold text-[var(--text)] mb-1">Payment Successful</h1>
            <p className="text-xs text-[var(--muted)] mb-5">Your repayment has been recorded.</p>
          </>
        )}

        {reference && status === "error" && (
          <>
            <div className="w-14 h-14 mx-auto bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <X size={24} className="text-red-600" />
            </div>
            <h1 className="text-lg font-bold text-[var(--text)] mb-1">Payment Verification Failed</h1>
            <p className="text-xs text-[var(--muted)] mb-5">
              We couldn&apos;t confirm this payment. If you were charged, contact support with reference{" "}
              <span className="font-mono">{reference}</span>.
            </p>
          </>
        )}

        <Button onClick={() => router.push("/borrower/loans")}>Back to My Loans</Button>
      </Card>
    </div>
  );
}
