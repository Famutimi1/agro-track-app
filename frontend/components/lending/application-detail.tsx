"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores";
import { applicationKeys, useApplication } from "@/lib/hooks/use-applications";
import { applicationsApi } from "@/lib/api";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";

export function ApplicationDetail({ borrower = false }: { borrower?: boolean }) {
  const params = useParams<{ id: string }>();
  const query = useApplication(params.id);
  const { user } = useAuthStore();
  const canReview = ["LENDER_ADMIN", "LENDER_MANAGER"].includes(user?.role || "");
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const run = async (action: () => Promise<unknown>, success: string) => {
    setPending(true); setError(""); setMessage("");
    try { await action(); await queryClient.invalidateQueries({ queryKey: applicationKeys.all }); await queryClient.invalidateQueries({ queryKey: ["loans"] }); setMessage(success); }
    catch (err) { setError((err as AxiosError<{ message: string }>).response?.data?.message || "Unable to save this change. Please retry."); }
    finally { setPending(false); }
  };
  if (query.isLoading) return <p>Loading application…</p>;
  if (query.isError || !query.data) return <div role="alert">Application unavailable. <Button variant="secondary" onClick={() => query.refetch()}>Retry</Button></div>;
  const app = query.data;
  const reviewable = ["SUBMITTED", "UNDER_REVIEW"].includes(app.status);
  return <div className="max-w-3xl space-y-6"><Link className="text-brand-green hover:underline" href={borrower ? "/borrower-applications" : "/applications"}>Back to applications</Link>
    <div><h1 className="text-2xl font-bold">{app.program?.name}</h1><p className="text-xs text-[var(--muted)] mt-2">Application {app.id}</p></div>
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 space-y-4">
      <StatusBadge status={app.status} type="application" /><p className="text-2xl font-bold">₦{Number(app.amount).toLocaleString()}</p>
      {!borrower && <p>Farmer: {app.borrower?.user.firstName} {app.borrower?.user.lastName} · {app.borrower?.farmerId}</p>}
      <p>{app.purpose || "No purpose provided"}</p><p className="text-sm text-[var(--muted)]">Submitted: {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Draft not submitted"}</p>
      {app.rejectionReason && <p>Reason for rejection: {app.rejectionReason}</p>}
      {!!app.loans?.length && <p>{app.loans.map(loan => <Link key={loan.id} href={`/${borrower ? "my-loans" : "loans"}/${loan.id}`} className="text-brand-green hover:underline">View approved loan</Link>)}</p>}
    </div>
    {message && <p role="status" className="text-green-700">{message}</p>}{error && <p role="alert" className="text-red-600">{error}</p>}
    {borrower ? <div className="flex gap-3 flex-wrap">
      {app.status === "DRAFT" && <Button disabled={pending} onClick={() => run(() => applicationsApi.submit(app.id), "Application submitted for lender review.")}>Submit saved draft</Button>}
      {["DRAFT", "SUBMITTED", "UNDER_REVIEW"].includes(app.status) && <Button variant="secondary" disabled={pending} onClick={() => run(() => applicationsApi.withdraw(app.id), "Application withdrawn.")}>Withdraw application</Button>}
    </div> : canReview && reviewable && <div className="space-y-4">
      <label className="block text-sm">Review notes<textarea className="block w-full mt-2 p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]" maxLength={500} value={notes} onChange={e => setNotes(e.target.value)} /></label>
      <div className="flex gap-3 flex-wrap">{app.status === "SUBMITTED" && <Button variant="secondary" disabled={pending} onClick={() => run(() => applicationsApi.markUnderReview(app.id), "Application marked under review.")}>Mark under review</Button>}
        <Button disabled={pending} onClick={() => run(() => applicationsApi.review(app.id, true, notes), "Application approved. The loan, tranches and repayment schedule were saved.")}>Approve application</Button></div>
      <label className="block text-sm">Rejection reason<input className="block w-full mt-2 p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]" maxLength={500} value={reason} onChange={e => setReason(e.target.value)} /></label>
      <Button variant="danger" disabled={pending || !reason.trim()} onClick={() => run(() => applicationsApi.reject(app.id, reason), "Application rejected.")}>Reject application</Button>
    </div>}
  </div>;
}
