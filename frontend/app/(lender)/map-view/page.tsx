"use client";

import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { borrowers } from "@/lib/data/borrowers";

const stateCoords: Record<string, { x: number; y: number }> = {
  Kebbi: { x: 120, y: 130 },
  Kano: { x: 220, y: 110 },
  Kaduna: { x: 200, y: 160 },
  Anambra: { x: 190, y: 280 },
  Oyo: { x: 110, y: 240 },
  Kogi: { x: 180, y: 250 },
  Imo: { x: 200, y: 300 },
  Ekiti: { x: 130, y: 250 },
};

export default function MapViewPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">Map View</h1>
        <p className="text-[13px] text-[var(--muted)]">
          Geographic distribution of borrowers across Nigeria
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 relative min-h-[500px] flex items-center justify-center">
          <svg viewBox="0 0 400 400" className="w-full h-full max-h-[500px]">
            {/* Simplified Nigeria outline */}
            <path
              d="M80,80 L320,80 L340,120 L330,180 L300,220 L280,280 L240,320 L200,340 L160,330 L120,300 L90,260 L70,200 L60,140 Z"
              fill="var(--input-bg)"
              stroke="var(--border)"
              strokeWidth="2"
            />
            {/* Borrower dots */}
            {borrowers.map((b) => {
              const coord = stateCoords[b.state];
              if (!coord) return null;
              const color = b.status === "Active" ? "#16a34a" : b.status === "At Risk" ? "#d97706" : b.status === "Defaulting" ? "#dc2626" : "#2563eb";
              return (
                <g key={b.id}>
                  <circle cx={coord.x} cy={coord.y} r={6} fill={color} opacity={0.8} />
                  <circle cx={coord.x} cy={coord.y} r={10} fill={color} opacity={0.2} />
                </g>
              );
            })}
          </svg>
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">Borrowers by State</h3>
          <div className="space-y-3">
            {Object.entries(
              borrowers.reduce((acc, b) => {
                acc[b.state] = (acc[b.state] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([state, count]) => (
              <div key={state} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-brand-green" />
                  <span className="text-xs text-[var(--text)]">{state}</span>
                </div>
                <span className="text-xs font-bold text-[var(--text)]">{count}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border)]">
            <h4 className="text-xs font-bold text-[var(--text)] mb-2">Legend</h4>
            <div className="space-y-1.5">
              {[
                { label: "Active", color: "#16a34a" },
                { label: "At Risk", color: "#d97706" },
                { label: "Defaulting", color: "#dc2626" },
                { label: "Completed", color: "#2563eb" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                  <span className="text-[11px] text-[var(--muted)]">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
