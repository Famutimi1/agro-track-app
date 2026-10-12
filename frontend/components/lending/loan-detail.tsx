"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores";
import { useLoan, loanKeys } from "@/lib/hooks/use-loans";
import { disbursementsApi, repaymentsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";

export function LoanDetail({ borrower = false }: { borrower?: boolean }) {
  const { id } = useParams<{ id: string }>();
  const query = useLoan(id);
  const { user } = useAuthStore();
  const canManage = !borrower && ["LENDER_ADMIN", "LENDER_MANAGER"].includes(user?.role || "");
  const client = useQueryClient();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [installmentId, setInstallmentId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [method, setMethod] = useState("BANK_TRANSFER");
  const run = async (action: () => Promise<unknown>, success: string) => {
    setPending(true); setError(""); setMessage("");
    try { await action(); await client.invalidateQueries({ queryKey: loanKeys.all }); await client.invalidateQueries({ queryKey: ["repayments"] }); await client.invalidateQueries({ queryKey: ["disbursements"] }); setMessage(success); }
    catch (err) { setError((err as AxiosError<{ message: string }>).response?.data?.message || "Unable to save this change. Please retry."); }
    finally { setPending(false); }
  };
  if (query.isLoading) return <p>Loading loan…</p>;
  if (query.isError || !query.data) return <p role="alert">Loan unavailable. <Button variant="secondary" onClick={() => query.refetch()}>Retry</Button></p>;
  const loan = query.data;
  const installment = loan.repayments?.find(r => r.id === installmentId);
  const field = "block w-full mt-1 p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)]";
  return <div className="max-w-4xl space-y-6"><Link className="text-brand-green hover:underline" href={borrower ? "/my-loans" : "/loans"}>Back to loans</Link><h1 className="text-2xl font-bold">{loan.program?.name}</h1><StatusBadge status={loan.status} type="loan" />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[["Principal", loan.amount], ["Total repaid", loan.amountPaid], ["Outstanding balance", Number(loan.totalRepayable) - Number(loan.amountPaid)]].map(([label, value]) => <div key={String(label)} className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl"><p className="text-sm text-[var(--muted)]">{label}</p><p className="text-xl font-bold">₦{Number(value).toLocaleString()}</p></div>)}</div>
    {message && <p role="status" className="text-green-700">{message}</p>}{error && <p role="alert" className="text-red-600">{error}</p>}
    <section className="space-y-3"><h2 className="text-lg font-semibold">Disbursement tranches</h2><p className="text-sm text-[var(--muted)]">Approval authorizes a tranche; it does not mean funds have been sent.</p>{loan.disbursements?.map(d => <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-4 border border-[var(--border)] bg-[var(--surface)] rounded-lg"><span>Tranche {d.trancheNumber} · ₦{Number(d.amount).toLocaleString()}</span><StatusBadge status={d.status} type="disbursement" />{canManage && d.status === "PENDING" && <Button disabled={pending} variant="secondary" onClick={() => run(() => disbursementsApi.approve(d.id), "Tranche approved for payment. Funds have not been sent.")}>Approve tranche</Button>}</div>)}</section>
    <section className="space-y-3"><h2 className="text-lg font-semibold">Repayment schedule</h2><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left border-b border-[var(--border)]"><th className="p-3">Due date</th><th className="p-3">Amount due</th><th className="p-3">Paid</th><th className="p-3">Status</th></tr></thead><tbody>{loan.repayments?.map(r => <tr key={r.id} className="border-b border-[var(--border)]"><td className="p-3">{new Date(r.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td><td className="p-3">₦{Number(r.amount).toLocaleString()}</td><td className="p-3">₦{Number(r.paidAmount || 0).toLocaleString()}</td><td className="p-3"><StatusBadge status={r.status} type="repayment" /></td></tr>)}</tbody></table></div></section>
    {canManage && loan.status === "ACTIVE" && <form className="space-y-4 border border-[var(--border)] rounded-xl p-5" onSubmit={e => { e.preventDefault(); run(() => repaymentsApi.record(installmentId, Number(amount), method, paymentRef.trim()), "Payment recorded and loan balance updated."); }}><h2 className="text-lg font-semibold">Record a received payment</h2><p className="text-sm text-[var(--muted)]">Record money already received. Use its original receipt/reference; submitting the same reference again will not add another payment.</p><label className="block text-sm">Installment<select className={field} value={installmentId} onChange={e => { setInstallmentId(e.target.value); setAmount(""); }} required><option value="">Select installment</option>{loan.repayments?.filter(r => r.status !== "PAID").map(r => <option key={r.id} value={r.id}>{new Date(r.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · ₦{(Number(r.amount) - Number(r.paidAmount || 0)).toLocaleString()} remaining</option>)}</select></label><label className="block text-sm">Received amount (₦)<input className={field} type="number" min="0.01" step="0.01" max={installment ? Number(installment.amount) - Number(installment.paidAmount || 0) : undefined} value={amount} onChange={e => setAmount(e.target.value)} required /></label><label className="block text-sm">Payment method<select className={field} value={method} onChange={e => setMethod(e.target.value)}>{["BANK_TRANSFER", "CARD", "USSD", "CASH", "MOBILE_MONEY"].map(m => <option key={m} value={m}>{m.replace(/_/g, " ")}</option>)}</select></label><label className="block text-sm">Receipt/reference<input className={field} minLength={5} maxLength={100} value={paymentRef} onChange={e => setPaymentRef(e.target.value)} required /></label><Button type="submit" disabled={pending}>{pending ? "Recording…" : "Record payment"}</Button></form>}
  </div>;
}
