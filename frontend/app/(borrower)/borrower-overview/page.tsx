"use client";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores";
import { LoansList } from "@/components/lending/loans-list";
export default function Overview() {
  const { user } = useAuthStore();
  return <div className="space-y-6"><h1 className="text-2xl font-bold">Welcome, {user?.firstName}</h1><p className="text-sm text-[var(--muted)]">Your farming finance account</p>
    {user?.borrowerProfile && <div className="rounded-xl border border-[var(--border)] p-5 bg-[var(--surface)]"><p className="font-semibold">FarmScore: {user.borrowerProfile.farmScore} · {user.borrowerProfile.farmScoreTier.replace(/_/g, " ")}</p><p className="text-sm text-[var(--muted)] mt-2">{user.borrowerProfile.farmerId} · {user.borrowerProfile.primaryCrop} · {user.borrowerProfile.state}</p></div>}
    <div className="flex gap-5 flex-wrap"><Link className="text-brand-green hover:underline" href="/borrower-applications/new">Apply to an active program</Link><Link className="text-brand-green hover:underline" href="/borrower-applications">View my applications</Link></div>
    <LoansList borrower />
  </div>;
}
