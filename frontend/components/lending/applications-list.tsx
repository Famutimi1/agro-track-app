"use client";

import Link from "next/link";
import { useState } from "react";
import { useApplications, applicationKeys } from "@/lib/hooks/use-applications";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Application, applicationsApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

function ApplicationRows({ applications, borrower }: { applications: Application[]; borrower: boolean }) {
  return <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
    <table className="w-full text-sm"><thead><tr className="text-left border-b border-[var(--border)]">
      <th className="p-4">Program</th>{!borrower && <th className="p-4">Farmer</th>}<th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4">Created</th><th className="p-4">Details</th>
    </tr></thead><tbody>{applications.map(app => <tr key={app.id} className="border-b border-[var(--border)] last:border-0">
      <td className="p-4 font-semibold">{app.program?.name}</td>{!borrower && <td className="p-4">{app.borrower?.user.firstName} {app.borrower?.user.lastName}</td>}
      <td className="p-4">₦{Number(app.amount).toLocaleString()}</td><td className="p-4"><StatusBadge status={app.status} type="application" /></td><td className="p-4">{new Date(app.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
      <td className="p-4"><Link className="text-brand-green font-semibold hover:underline" href={`/${borrower ? "borrower-applications" : "applications"}/${app.id}`}>View application</Link></td>
    </tr>)}</tbody></table>
  </div>;
}
function LenderApplications() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const query = useApplications({ page, limit: 20, ...(status ? { status } : {}) });
  return <div className="space-y-5"><h1 className="text-2xl font-bold">Loan applications</h1><p className="text-sm text-[var(--muted)]">Review applications submitted to your organization.</p>
    <label className="text-sm">Status <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="ml-2 p-2 rounded border border-[var(--border)] bg-[var(--surface)]"><option value="">All statuses</option>{["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "WITHDRAWN"].map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}</select></label>
    {query.isLoading ? <p>Loading applications…</p> : query.isError ? <div role="alert">Unable to load applications. <Button onClick={() => query.refetch()} variant="secondary">Retry</Button></div> : query.data?.data.length ? <ApplicationRows applications={query.data.data} borrower={false} /> : <p className="p-6 border border-[var(--border)] rounded-xl">No applications match this view.</p>}
    {query.data && <div className="flex items-center gap-3"><Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button><span className="text-sm">Page {page} · {query.data.pagination.total} applications</span><Button variant="secondary" disabled={page >= query.data.pagination.totalPages} onClick={() => setPage(page + 1)}>Next</Button></div>}
  </div>;
}
function BorrowerApplications() {
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: [...applicationKeys.mine(), page], queryFn: () => applicationsApi.listMine({ page }) });
  return <div className="space-y-5"><div className="flex flex-wrap justify-between items-center gap-3"><h1 className="text-2xl font-bold">My applications</h1><Link href="/borrower-applications/new" className="text-brand-green font-semibold hover:underline">New application</Link></div><p className="text-sm text-[var(--muted)]">Track saved drafts and submitted loan applications.</p>
    {query.isLoading ? <p>Loading applications…</p> : query.isError ? <div role="alert">Unable to load applications. <Button onClick={() => query.refetch()} variant="secondary">Retry</Button></div> : query.data?.data.length ? <ApplicationRows applications={query.data.data} borrower /> : <p className="p-6 border border-[var(--border)] rounded-xl">You have no applications yet. Choose a program to get started.</p>}
    {query.data && <div className="flex items-center gap-3"><Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button><span className="text-sm">Page {page} · {query.data.pagination.total} applications</span><Button variant="secondary" disabled={page >= query.data.pagination.totalPages} onClick={() => setPage(page + 1)}>Next</Button></div>}
  </div>;
}
export function ApplicationsList({ borrower = false }: { borrower?: boolean }) { return borrower ? <BorrowerApplications /> : <LenderApplications />; }
