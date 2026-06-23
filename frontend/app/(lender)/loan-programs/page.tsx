"use client";

import { useState } from "react";
import { Filter, Users, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { programs } from "@/lib/data/programs";
import { cropColors } from "@/lib/data/borrowers";

export default function LoanProgramsPage() {
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = filterStatus === "All"
    ? programs
    : programs.filter((p) => p.status === filterStatus);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">
            Loan Programs
          </h1>
          <p className="text-[13px] text-[var(--muted)]">
            {programs.length} programs across {programs.reduce((acc, p) => acc + p.states, 0)} states
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {["All", "Active", "Draft", "Closed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterStatus === s
                ? "bg-brand-green text-white"
                : "bg-[var(--input-bg)] text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Program Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <Card key={p.id} className="relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
              style={{ background: p.color }}
            />
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-[var(--text)] truncate">
                  {p.name}
                </h3>
                <p className="text-[11px] text-[var(--muted)]">{p.lender}</p>
              </div>
              <StatusPill status={p.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-[10px] text-[var(--muted)] uppercase">Pool</p>
                <p className="text-sm font-bold text-[var(--text)]">₦{p.totalPool}M</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--muted)] uppercase">Disbursed</p>
                <p className="text-sm font-bold text-[var(--text)]">₦{p.disbursed}M</p>
              </div>
              <div className="flex items-center gap-1">
                <Users size={11} className="text-[var(--muted)]" />
                <span className="text-xs text-[var(--muted)]">{p.borrowers.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={11} className="text-[var(--muted)]" />
                <span className="text-xs text-[var(--muted)]">{p.states} states</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {p.cropTypes.map((c) => (
                <span
                  key={c}
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{
                    background: cropColors[c]?.bg || "#f3f4f6",
                    color: cropColors[c]?.color || "#6b7280",
                  }}
                >
                  {c}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--muted)]">
                {p.interest}% interest · {p.layers} layers
              </span>
              <span className="text-[11px] font-semibold" style={{ color: p.color }}>
                {p.repayRate}% repaid
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-1.5 rounded-full bg-[var(--input-bg)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(p.disbursed / p.totalPool) * 100}%`,
                  background: p.color,
                }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
