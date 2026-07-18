"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";
import { useDiscoverPrograms, useMyBorrowerProfile, useMyApplications } from "@/lib/hooks";
import { computeProgramMatch } from "@/lib/utils";

const TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  INPUT_CREDIT: { color: "#16a34a", bg: "#16a34a1a" },
  CASH_LOAN: { color: "#2563eb", bg: "#2563eb1a" },
  EQUIPMENT_LEASE: { color: "#d97706", bg: "#d977061a" },
  INSURANCE: { color: "#7c3aed", bg: "#7c3aed1a" },
};

const TYPE_LABELS: Record<string, string> = {
  INPUT_CREDIT: "Input Credit",
  CASH_LOAN: "Cash Loan",
  EQUIPMENT_LEASE: "Equipment Lease",
  INSURANCE: "Insurance",
};

const SORT_OPTIONS = [
  { value: "match", label: "Best Match" },
  { value: "interest", label: "Lowest Interest" },
  { value: "amount", label: "Highest Amount" },
];

// Applications that still block re-applying to the same programme.
const ACTIVE_APP_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "APPROVED"];

function formatNaira(amount: number) {
  return `₦${Math.round(amount).toLocaleString()}`;
}

export default function DiscoverPage() {
  const router = useRouter();
  const { data: profile } = useMyBorrowerProfile();
  const { data, isLoading } = useDiscoverPrograms();
  const { data: applicationsData } = useMyApplications();
  const programs = data?.data || [];

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("match");

  // Programme IDs the farmer already has an in-flight application for.
  const appliedProgramIds = useMemo(() => {
    const map = new Map<string, string>();
    (applicationsData?.data || []).forEach((a) => {
      if (ACTIVE_APP_STATUSES.includes(a.status)) map.set(a.programId, a.status);
    });
    return map;
  }, [applicationsData]);

  const ranked = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...programs]
      .map((p) => ({ program: p, match: computeProgramMatch(p, profile) }))
      .filter(({ program: p }) => {
        if (typeFilter !== "ALL" && p.type !== typeFilter) return false;
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          (p.lenderOrg?.name || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "interest") return a.program.interestRate - b.program.interestRate;
        if (sortBy === "amount") return b.program.maxAmount - a.program.maxAmount;
        return b.match - a.match;
      });
  }, [programs, profile, search, typeFilter, sortBy]);

  const topMatch = programs.length
    ? Math.max(...programs.map((p) => computeProgramMatch(p, profile)))
    : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">
          Discover Programs
        </h1>
        <p className="text-[13px] text-[var(--muted)]">
          Loan and grant programs you may be eligible for
        </p>
      </div>

      {/* Match banner */}
      {!isLoading && programs.length > 0 && (
        <Card className="mb-5 flex items-center gap-3 border-l-4 border-l-brand-green">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} className="text-brand-green" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text)]">
              {programs.length} program{programs.length === 1 ? "" : "s"} available · up to {topMatch}% match
            </p>
            <p className="text-xs text-[var(--muted)]">
              Ranked by fit with your FarmScore, location, and crops.
            </p>
          </div>
        </Card>
      )}

      {/* Search + filters */}
      {!isLoading && programs.length > 0 && (
        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <Input
              className="pl-9"
              placeholder="Search by program or lender"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-sm text-[var(--text)]"
          >
            <option value="ALL">All Types</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-sm text-[var(--text)]"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      {isLoading ? (
        <Card>
          <p className="text-xs text-[var(--muted)] text-center py-8">Loading programs…</p>
        </Card>
      ) : ranked.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <Search size={32} className="text-[var(--muted)] mb-3" />
          <p className="text-sm font-semibold text-[var(--text)] mb-1">
            {programs.length === 0 ? "No programs available right now" : "No programs match your filters"}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {programs.length === 0
              ? "Check back soon for new loan and grant programs."
              : "Try adjusting your search or filters."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ranked.map(({ program: p, match }) => {
            const colors = TYPE_COLORS[p.type] || { color: "#16a34a", bg: "#16a34a1a" };
            const appliedStatus = appliedProgramIds.get(p.id);
            return (
              <Card key={p.id} className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full" style={{ background: colors.color }} />
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[var(--text)] truncate">{p.name}</h3>
                    <p className="text-[11px] text-[var(--muted)]">{p.lenderOrg?.name || "Lender"}</p>
                  </div>
                  <div
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: colors.bg, color: colors.color }}
                  >
                    {match}% match
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-[10px] text-[var(--muted)] uppercase">Amount</p>
                    <p className="text-sm font-bold text-[var(--text)]">
                      {formatNaira(p.minAmount)} – {formatNaira(p.maxAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--muted)] uppercase">Interest Rate</p>
                    <p className="text-sm font-bold text-[var(--text)]">{p.interestRate}%</p>
                  </div>
                </div>

                <div className="h-1.5 rounded-full bg-[var(--input-bg)] overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${match}%`, background: colors.color }}
                  />
                </div>

                {appliedStatus ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    disabled
                  >
                    {appliedStatus === "APPROVED" ? "Approved" : "Application in progress"}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push(`/borrower/applications/new?programId=${p.id}`)}
                  >
                    Apply Now
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
