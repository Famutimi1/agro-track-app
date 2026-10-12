"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useDiscoverPrograms } from "@/lib/hooks/use-programs";
import { applicationsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function ApplicationForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useDiscoverPrograms();
  const [programId, setProgramId] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [pending, setPending] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const program = query.data?.data.find(p => p.id === programId);
  const save = async (submit: boolean) => {
    if (submit && !agreed) { setError("Confirm your application details before submitting."); return; }
    setPending(true); setError("");
    try {
      // Keep the saved ID when submission fails so retry never creates a duplicate draft.
      let id = draftId;
      if (!id) { const draft = await applicationsApi.create({ programId, amount: Number(amount), purpose: purpose.trim() }); id = draft.id; setDraftId(id); }
      if (submit) await applicationsApi.submit(id);
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      router.push(`/borrower-applications/${id}`);
    } catch (err) { setError((err as AxiosError<{ message: string }>).response?.data?.message || "Unable to save application. Your entries remain here for retry."); }
    finally { setPending(false); }
  };
  const field = "w-full mt-2 p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]";
  return <div className="max-w-2xl space-y-6"><Link href="/borrower-applications" className="text-brand-green hover:underline">Back to my applications</Link><h1 className="text-2xl font-bold">New loan application</h1><p className="text-sm text-[var(--muted)]">Choose an active program and explain how you will use the funds. You can save a draft before sending it to the lender.</p>
    {query.isLoading ? <p>Loading active programs…</p> : query.isError ? <p role="alert">Unable to load programs. <Button onClick={() => query.refetch()} variant="secondary">Retry</Button></p> : !query.data?.data.length ? <p>No programs are currently accepting applications.</p> : <form className="space-y-5" onSubmit={e => { e.preventDefault(); save(true); }}>
      <label className="block text-sm font-semibold">Program<select className={field} value={programId} onChange={e => { setProgramId(e.target.value); setAmount(""); }} required disabled={pending || !!draftId}><option value="">Select a program</option>{query.data.data.map(p => <option key={p.id} value={p.id}>{p.name} · {p.lenderOrg?.name}</option>)}</select></label>
      {program && <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm space-y-1"><p>{program.description}</p><p>₦{Number(program.minAmount).toLocaleString()}–₦{Number(program.maxAmount).toLocaleString()} · {program.interestRate}% interest · {program.durationMonths} months</p><p>Minimum FarmScore: {program.requiredScore}</p></div>}
      <label className="block text-sm font-semibold">Requested amount (₦)<input className={field} type="number" step="0.01" min={program ? Number(program.minAmount) : 1} max={program ? Number(program.maxAmount) : undefined} value={amount} onChange={e => setAmount(e.target.value)} required disabled={pending || !!draftId} /></label>
      <label className="block text-sm font-semibold">Purpose<textarea className={field} minLength={10} maxLength={500} value={purpose} onChange={e => setPurpose(e.target.value)} required disabled={pending || !!draftId} /></label>
      <label className="flex items-start gap-3 text-sm"><input className="mt-1" type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />I confirm that these application details are accurate and ready for lender review.</label>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      <div className="flex gap-3 flex-wrap"><Button type="submit" disabled={pending || !program || !agreed}>{pending ? "Saving…" : "Submit application"}</Button><Button type="button" variant="secondary" disabled={pending || !program || Number(amount) < Number(program.minAmount) || Number(amount) > Number(program.maxAmount) || purpose.trim().length < 10} onClick={() => save(false)}>Save draft</Button></div>
    </form>}
  </div>;
}
