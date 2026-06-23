"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import { featureFlags } from "@/lib/data/admin-data";

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState(featureFlags);

  const toggleFlag = (index: number) => {
    setFlags((prev) =>
      prev.map((f, i) => (i === index ? { ...f, enabled: !f.enabled } : f))
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">
          Feature Flags
        </h1>
        <p className="text-[13px] text-[var(--muted)]">
          Control feature rollouts across all lender plans
        </p>
      </div>

      <div className="space-y-3">
        {flags.map((f, i) => (
          <Card key={f.name} className="flex items-center gap-4">
            <Toggle on={f.enabled} onToggle={() => toggleFlag(i)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-sm font-bold text-[var(--text)]">{f.name}</h3>
                {f.beta && (
                  <Badge text="BETA" bg="#ede9fe" color="#7c3aed" />
                )}
              </div>
              <p className="text-xs text-[var(--muted)]">{f.desc}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {f.plans.map((p) => (
                <span
                  key={p}
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--input-bg)] text-[var(--muted)]"
                >
                  {p}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
