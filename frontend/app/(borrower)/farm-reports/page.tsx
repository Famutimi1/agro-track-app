"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { Camera, Check } from "lucide-react";

const pastReports = [
  { month: "June 2025", status: "Submitted", score: "+15 pts", date: "Jun 8" },
  { month: "May 2025", status: "Submitted", score: "+12 pts", date: "May 6" },
  { month: "April 2025", status: "Submitted", score: "+18 pts", date: "Apr 5" },
  { month: "March 2025", status: "Submitted", score: "+10 pts", date: "Mar 7" },
];

export default function FarmReportsPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">Farm Reports</h1>
        <p className="text-[13px] text-[var(--muted)]">
          Submit monthly farm activity reports to maintain your FarmScore
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Submit Report */}
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">
            July 2025 Report
          </h3>
          {!submitted ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">
                  Crop Stage
                </label>
                <select className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-sm text-[var(--text)]">
                  <option>Vegetative Growth</option>
                  <option>Flowering</option>
                  <option>Grain Filling</option>
                  <option>Maturity</option>
                  <option>Harvested</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">
                  Estimated Yield (kg)
                </label>
                <Input type="number" placeholder="e.g., 3500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">
                  Notes
                </label>
                <Textarea rows={3} placeholder="Any observations about crop health, weather, etc." />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">
                  Farm Photo
                </label>
                <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center cursor-pointer hover:border-brand-green transition-colors">
                  <Camera size={24} className="mx-auto text-[var(--muted)] mb-2" />
                  <p className="text-xs text-[var(--muted)]">Click to upload or drag photo here</p>
                </div>
              </div>
              <Button className="w-full" onClick={() => setSubmitted(true)}>
                Submit Report
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-14 h-14 mx-auto bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
                <Check size={24} className="text-green-600" />
              </div>
              <h4 className="text-base font-bold text-[var(--text)] mb-1">Report Submitted!</h4>
              <p className="text-xs text-[var(--muted)]">+15 FarmScore points will be added within 24 hours</p>
            </div>
          )}
        </Card>

        {/* Past Reports */}
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">Report History</h3>
          <div className="space-y-3">
            {pastReports.map((r) => (
              <div key={r.month} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                <div>
                  <p className="text-xs font-medium text-[var(--text)]">{r.month}</p>
                  <p className="text-[11px] text-[var(--muted)]">Submitted {r.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    {r.score}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
