"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { loansApi } from "@/lib/api";
import { loanKeys } from "@/lib/hooks/use-loans";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";

export function LoansList({ borrower = false }: { borrower?: boolean }) {
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: [...loanKeys.all, borrower ? "mine" : "list", { page }], queryFn: () => borrower ? loansApi.listMine({ page }) : loansApi.listForLender({ page }) });
  return <div className="space-y-5"><h1 className="text-2xl font-bold">{borrower ? "My loans" : "Loan portfolio"}</h1><p className="text-sm text-[var(--muted)]">Approved loans and their current recorded balances.</p>
    {query.isLoading ? <p>Loading loans…</p> : query.isError ? <p role="alert">Unable to load loans. <Button variant="secondary" onClick={() => query.refetch()}>Retry</Button></p> : !query.data?.data.length ? <p className="p-5 border rounded-xl border-[var(--border)]">No approved loans yet.</p> : <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]"><table className="w-full text-sm"><thead><tr className="text-left border-b border-[var(--border)]"><th className="p-4">Program</th>{!borrower && <th className="p-4">Farmer</th>}<th className="p-4">Principal</th><th className="p-4">Repaid</th><th className="p-4">Balance</th><th className="p-4">Status</th><th className="p-4">Details</th></tr></thead><tbody>{query.data.data.map(loan => <tr key={loan.id} className="border-b border-[var(--border)] last:border-0"><td className="p-4 font-semibold">{loan.program?.name}</td>{!borrower && <td className="p-4">{loan.borrower?.user.firstName} {loan.borrower?.user.lastName}</td>}<td className="p-4">₦{Number(loan.amount).toLocaleString()}</td><td className="p-4">₦{Number(loan.amountPaid).toLocaleString()}</td><td className="p-4">₦{(Number(loan.totalRepayable) - Number(loan.amountPaid)).toLocaleString()}</td><td className="p-4"><StatusBadge status={loan.status} type="loan" /></td><td className="p-4"><Link className="text-brand-green hover:underline" href={`/${borrower ? "my-loans" : "loans"}/${loan.id}`}>View loan</Link></td></tr>)}</tbody></table></div>}
    {query.data && <div className="flex items-center gap-3"><Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button><span className="text-sm">Page {page} · {query.data.pagination.total} loans</span><Button variant="secondary" disabled={page >= query.data.pagination.totalPages} onClick={() => setPage(page + 1)}>Next</Button></div>}
  </div>;
}
