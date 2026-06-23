"use client";

import { Card } from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/score-ring";
import { LineChartComponent } from "@/components/charts/line-chart";
import { scoreHistory } from "@/lib/data/borrower-data";

const scoreBreakdown = [
  { label: "Repayment History", score: 280, max: 300, color: "#16a34a" },
  { label: "Farm Reports", score: 185, max: 200, color: "#2563eb" },
  { label: "Crop Yield", score: 140, max: 150, color: "#7c3aed" },
  { label: "Tenure", score: 120, max: 100, color: "#d97706" },
  { label: "Account Activity", score: 90, max: 100, color: "#0891b2" },
];

const tips = [
  "Submit your farm report on time every month (+10-20 pts)",
  "Maintain consecutive on-time repayments (+15 pts per streak)",
  "Upload farm photos with GPS verification (+5 pts)",
  "Complete your profile with bank and ID details (+10 pts one-time)",
];

export default function FarmScorePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">FarmScore</h1>
        <p className="text-[13px] text-[var(--muted)]">
          Your agricultural credit score — portable and accepted by major lenders
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Score */}
        <Card className="flex flex-col items-center justify-center py-8">
          <ScoreRing score={815} size={160} />
          <p className="text-sm font-bold text-[var(--text)] mt-4">Platinum Tier</p>
          <p className="text-xs text-[var(--muted)]">Top 5% of all borrowers</p>
          <p className="text-xs text-green-600 font-semibold mt-2">+40 pts this month</p>
        </Card>

        {/* Breakdown */}
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">Score Breakdown</h3>
          <div className="space-y-4">
            {scoreBreakdown.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[var(--text)]">{s.label}</span>
                  <span className="text-xs font-bold text-[var(--text)]">{s.score}/{s.max}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--input-bg)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min((s.score / s.max) * 100, 100)}%`, background: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        {/* History Chart */}
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">Score History</h3>
          <LineChartComponent
            data={scoreHistory}
            xKey="m"
            lines={[{ key: "s", color: "#7c3aed", name: "FarmScore" }]}
            height={200}
          />
        </Card>

        {/* Tips */}
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">How to Improve Your Score</h3>
          <div className="space-y-3">
            {tips.map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <p className="text-xs text-[var(--muted)] leading-relaxed">{t}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
