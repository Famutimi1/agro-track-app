"use client";
import Link from "next/link";
import { useLenderDashboard } from "@/lib/hooks/use-lender";
import { useAuthStore } from "@/lib/stores";
import { Button } from "@/components/ui/button";
export default function Dashboard() {
  const { user } = useAuthStore();
  const query = useLenderDashboard();
  return <div className="space-y-6"><h1 className="text-2xl font-bold">Welcome, {user?.firstName}</h1><p className="text-sm text-[var(--muted)]">{user?.lenderOrg?.name} · Your recorded lending portfolio</p>
    {query.isLoading ? <p>Loading portfolio…</p> : query.isError ? <p role="alert">Unable to load portfolio. <Button variant="secondary" onClick={() => query.refetch()}>Retry</Button></p> : query.data && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[
      ["Total disbursed", `₦${Number(query.data.totalDisbursed).toLocaleString()}`], ["Total repaid", `₦${Number(query.data.totalRepaid).toLocaleString()}`], ["Active loans", query.data.activeLoans], ["Borrowers", query.data.totalBorrowers], ["Pending applications", query.data.applicationsPending], ["Programs", query.data.programCount],
    ].map(([label,value]) => <div key={String(label)} className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)]"><p className="text-sm text-[var(--muted)]">{label}</p><p className="text-2xl font-bold mt-2">{value}</p></div>)}</div>}
    <section className="space-y-3"><h2 className="text-lg font-semibold">Manage your lending</h2><div className="flex gap-5 flex-wrap"><Link className="text-brand-green hover:underline" href="/applications">Review applications</Link><Link className="text-brand-green hover:underline" href="/loans">View loans and repayment schedules</Link></div></section>
  </div>;
}
