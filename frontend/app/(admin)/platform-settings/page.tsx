"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">Admin Settings</h1>
        <p className="text-[13px] text-[var(--muted)]">Platform-wide configuration</p>
      </div>

      <div className="space-y-5 max-w-2xl">
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">Platform Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Platform Name</label>
              <Input defaultValue="AgroTrack" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Support Email</label>
              <Input defaultValue="support@agrotrack.ng" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Default Currency</label>
              <Input defaultValue="NGN (₦)" disabled />
            </div>
            <Button>Save Configuration</Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">System Toggles</h3>
          <div className="space-y-4">
            {[
              { label: "Maintenance Mode", desc: "Show maintenance page to all users", on: false },
              { label: "Allow New Registrations", desc: "Enable new lender signups", on: true },
              { label: "Email Notifications", desc: "Send system-wide email alerts", on: true },
              { label: "API Rate Limiting", desc: "Enforce 1000 req/min per lender", on: true },
              { label: "Debug Mode", desc: "Enable verbose logging (performance impact)", on: false },
            ].map((t) => (
              <div key={t.label} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-[var(--text)]">{t.label}</p>
                  <p className="text-[11px] text-[var(--muted)]">{t.desc}</p>
                </div>
                <Toggle on={t.on} onToggle={() => {}} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
