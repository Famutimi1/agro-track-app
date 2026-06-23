"use client";

import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { MapPin, Phone } from "lucide-react";

const agents = [
  { name: "Ibrahim Suleiman", state: "Kebbi", registrations: 342, verified: 318, rating: 5, phone: "0803 xxx xxxx", active: true },
  { name: "Adaeze Okoro", state: "Anambra", registrations: 287, verified: 271, rating: 5, phone: "0706 xxx xxxx", active: true },
  { name: "Musa Danjuma", state: "Kogi", registrations: 198, verified: 184, rating: 4, phone: "0812 xxx xxxx", active: true },
  { name: "Funke Adeyemi", state: "Oyo", registrations: 256, verified: 234, rating: 4, phone: "0901 xxx xxxx", active: true },
  { name: "Chidi Nwosu", state: "Imo", registrations: 145, verified: 132, rating: 4, phone: "0813 xxx xxxx", active: false },
  { name: "Halima Bello", state: "Kano", registrations: 401, verified: 389, rating: 5, phone: "0705 xxx xxxx", active: true },
];

export default function FieldAgentsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">Field Agents</h1>
        <p className="text-[13px] text-[var(--muted)]">
          {agents.length} registered field agents across {new Set(agents.map(a => a.state)).size} states
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((a) => (
          <Card key={a.name}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">{a.name}</h3>
                <div className="flex items-center gap-1 text-[11px] text-[var(--muted)]">
                  <MapPin size={10} />
                  {a.state}
                </div>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${a.active ? "bg-green-500" : "bg-gray-400"}`} />
            </div>

            <StarRating rating={a.rating} />

            <div className="grid grid-cols-2 gap-3 mt-3 mb-3">
              <div>
                <p className="text-[10px] text-[var(--muted)] uppercase">Registrations</p>
                <p className="text-sm font-bold text-[var(--text)]">{a.registrations}</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--muted)] uppercase">Verified</p>
                <p className="text-sm font-bold text-green-600">{a.verified}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
              <Phone size={11} />
              {a.phone}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
