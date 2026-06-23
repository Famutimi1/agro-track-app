"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { borrowerPrograms } from "@/lib/data/borrower-data";

export default function DiscoverPage() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {borrowerPrograms.map((p) => (
          <Card key={p.name} className="relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ background: p.color }}
            />
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-[var(--text)] truncate">
                  {p.name}
                </h3>
                <p className="text-[11px] text-[var(--muted)]">{p.lender}</p>
              </div>
              <div
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: p.bg, color: p.color }}
              >
                {p.match}% match
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-[10px] text-[var(--muted)] uppercase">Amount</p>
                <p className="text-sm font-bold text-[var(--text)]">{p.amount}</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--muted)] uppercase">Interest Rate</p>
                <p className="text-sm font-bold text-[var(--text)]">{p.rate}</p>
              </div>
            </div>

            <div className="h-1.5 rounded-full bg-[var(--input-bg)] overflow-hidden mb-3">
              <div
                className="h-full rounded-full"
                style={{ width: `${p.match}%`, background: p.color }}
              />
            </div>

            <Button variant="secondary" size="sm" className="w-full">
              Apply Now
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
