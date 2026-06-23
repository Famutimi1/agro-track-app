"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusPill, PlanBadge } from "@/components/ui/badge";
import { lenderAccounts } from "@/lib/data/admin-data";

export default function LenderAccountsPage() {
  const [search, setSearch] = useState("");

  const filtered = lenderAccounts.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">
          Lender Accounts
        </h1>
        <p className="text-[13px] text-[var(--muted)]">
          {lenderAccounts.length} registered lender organizations
        </p>
      </div>

      <div className="flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 max-w-sm mb-5">
        <Search size={14} className="text-[var(--muted)]" />
        <input
          className="bg-transparent border-none outline-none text-[13px] flex-1 text-[var(--text)] placeholder:text-[var(--muted)]"
          placeholder="Search lenders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">ID</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Organization</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Type</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Plan</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Status</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Farmers</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Disbursed</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--input-bg)] transition-colors">
                <td className="py-3 text-xs font-mono text-[var(--muted)]">{l.id}</td>
                <td className="py-3 text-xs font-medium text-[var(--text)] max-w-[200px] truncate">{l.name}</td>
                <td className="py-3 text-xs text-[var(--muted)]">{l.type}</td>
                <td className="py-3"><PlanBadge plan={l.plan} /></td>
                <td className="py-3"><StatusPill status={l.status} /></td>
                <td className="py-3 text-xs text-[var(--text)]">{l.farmers.toLocaleString()}</td>
                <td className="py-3 text-xs font-semibold text-[var(--text)]">{l.disbursed}</td>
                <td className="py-3 text-xs text-green-600 font-semibold">{l.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
