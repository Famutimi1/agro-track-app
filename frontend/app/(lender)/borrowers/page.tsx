"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/badge";
import { borrowers, cropColors } from "@/lib/data/borrowers";

export default function BorrowersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = borrowers.filter((b) => {
    const matchSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">
          Borrowers
        </h1>
        <p className="text-[13px] text-[var(--muted)]">
          {borrowers.length} registered borrowers across all programs
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center mb-5 flex-wrap">
        <div className="flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 flex-1 max-w-xs">
          <Search size={14} className="text-[var(--muted)]" />
          <input
            className="bg-transparent border-none outline-none text-[13px] flex-1 text-[var(--text)] placeholder:text-[var(--muted)]"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["All", "Active", "At Risk", "Defaulting", "Completed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === s
                  ? "bg-brand-green text-white"
                  : "bg-[var(--input-bg)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">ID</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Name</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">State</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Crop</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Loan</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Score</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Status</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Layers</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--input-bg)] transition-colors">
                <td className="py-3 text-xs font-mono text-[var(--muted)]">{b.id}</td>
                <td className="py-3 text-xs font-medium text-[var(--text)]">{b.name}</td>
                <td className="py-3 text-xs text-[var(--muted)]">{b.state}</td>
                <td className="py-3">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded"
                    style={{
                      background: cropColors[b.crop]?.bg || "#f3f4f6",
                      color: cropColors[b.crop]?.color || "#6b7280",
                    }}
                  >
                    {b.crop}
                  </span>
                </td>
                <td className="py-3 text-xs font-semibold text-[var(--text)]">{b.loan}</td>
                <td className="py-3">
                  <span className={`text-xs font-bold ${
                    b.score >= 750 ? "text-green-600" :
                    b.score >= 600 ? "text-blue-600" :
                    b.score >= 450 ? "text-yellow-600" : "text-red-600"
                  }`}>
                    {b.score}
                  </span>
                </td>
                <td className="py-3"><StatusPill status={b.status} /></td>
                <td className="py-3">
                  <div className="flex gap-1">
                    {b.layers.map((l, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                          l ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
