"use client";

import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/badge";
import { Users, MapPin } from "lucide-react";

const cooperatives = [
  { name: "Kebbi Rice Farmers Cooperative", state: "Kebbi", members: 245, registered: "Jan 2025", status: "Active", leader: "Alhaji Bello" },
  { name: "Anambra Cassava Growers Union", state: "Anambra", members: 189, registered: "Feb 2025", status: "Active", leader: "Chief Okafor" },
  { name: "Oyo Maize Producers Association", state: "Oyo", members: 312, registered: "Dec 2024", status: "Active", leader: "Mrs. Adeyemi" },
  { name: "Kano Groundnut Cooperative", state: "Kano", members: 456, registered: "Nov 2024", status: "Active", leader: "Malam Garba" },
  { name: "Ekiti Cocoa Farmers Network", state: "Ekiti", members: 78, registered: "Apr 2025", status: "Pending", leader: "Mr. Fashola" },
];

export default function CooperativesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">Cooperatives</h1>
        <p className="text-[13px] text-[var(--muted)]">
          {cooperatives.length} registered cooperative groups
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cooperatives.map((c) => (
          <Card key={c.name}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-bold text-[var(--text)]">{c.name}</h3>
              <StatusPill status={c.status} />
            </div>
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                <MapPin size={11} /> {c.state}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                <Users size={11} /> {c.members} members
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
              <span className="text-[11px] text-[var(--muted)]">Led by {c.leader}</span>
              <span className="text-[11px] text-[var(--muted)]">Since {c.registered}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
