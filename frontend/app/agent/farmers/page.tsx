"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search, Plus, MapPin, Phone, Calendar, ChevronRight,
  CheckCircle, Clock, Filter, User
} from "lucide-react";
import { Button } from "@/components/ui/button";

const mockFarmers = [
  { id: "FRM-2025-148", name: "Aisha Mohammed", phone: "+234 803 111 2222", state: "Kebbi", lga: "Argungu", registeredAt: "2025-06-23", status: "VERIFIED", farmSize: 2.5, crop: "Rice", farmScore: 680 },
  { id: "FRM-2025-147", name: "Bello Abdullahi", phone: "+234 803 222 3333", state: "Kebbi", lga: "Birnin Kebbi", registeredAt: "2025-06-22", status: "VERIFIED", farmSize: 3.0, crop: "Rice", farmScore: 720 },
  { id: "FRM-2025-146", name: "Chioma Eze", phone: "+234 803 333 4444", state: "Kebbi", lga: "Kalgo", registeredAt: "2025-06-21", status: "PENDING_VERIFICATION", farmSize: 1.8, crop: "Maize", farmScore: null },
  { id: "FRM-2025-145", name: "Danjuma Ibrahim", phone: "+234 803 444 5555", state: "Kebbi", lga: "Gwandu", registeredAt: "2025-06-20", status: "VERIFIED", farmSize: 4.2, crop: "Rice", farmScore: 650 },
  { id: "FRM-2025-144", name: "Esther Obi", phone: "+234 803 555 6666", state: "Kebbi", lga: "Argungu", registeredAt: "2025-06-19", status: "VERIFIED", farmSize: 2.0, crop: "Vegetables", farmScore: 590 },
];

export default function AgentFarmersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredFarmers = mockFarmers.filter(farmer => {
    const matchesSearch =
      farmer.name.toLowerCase().includes(search.toLowerCase()) ||
      farmer.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || farmer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Registered Farmers</h1>
          <p className="text-sm text-[var(--muted)]">Farmers you&apos;ve registered in your assigned area</p>
        </div>
        <Link href="/agent/farmers/register">
          <Button variant="primary" className="bg-orange-600 hover:bg-orange-700">
            <Plus size={16} className="mr-2" /> Register New Farmer
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search by name or farmer ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
        >
          <option value="ALL">All Status</option>
          <option value="VERIFIED">Verified</option>
          <option value="PENDING_VERIFICATION">Pending Verification</option>
        </select>
      </div>

      {/* Farmers Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredFarmers.map(farmer => (
          <div
            key={farmer.id}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-orange-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-semibold">
                  {farmer.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text)]">{farmer.name}</h3>
                  <p className="text-xs text-[var(--muted)] font-mono">{farmer.id}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                farmer.status === "VERIFIED"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}>
                {farmer.status === "VERIFIED" ? (
                  <span className="flex items-center gap-1"><CheckCircle size={12} /> Verified</span>
                ) : (
                  <span className="flex items-center gap-1"><Clock size={12} /> Pending</span>
                )}
              </span>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Phone size={14} />
                <span>{farmer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <MapPin size={14} />
                <span>{farmer.lga}, {farmer.state}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Calendar size={14} />
                <span>Registered {new Date(farmer.registeredAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
              <div className="flex gap-4 text-xs">
                <span className="text-[var(--muted)]">{farmer.farmSize} ha</span>
                <span className="text-[var(--muted)]">{farmer.crop}</span>
                {farmer.farmScore && (
                  <span className={`font-semibold ${
                    farmer.farmScore >= 700 ? "text-green-600" : farmer.farmScore >= 500 ? "text-blue-600" : "text-yellow-600"
                  }`}>
                    Score: {farmer.farmScore}
                  </span>
                )}
              </div>
              <Link
                href={`/agent/farmers/${farmer.id}`}
                className="text-sm text-orange-600 hover:underline flex items-center gap-1"
              >
                View <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredFarmers.length === 0 && (
        <div className="text-center py-12">
          <User size={48} className="mx-auto text-[var(--muted)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text)] mb-2">No farmers found</h3>
          <p className="text-[var(--muted)] mb-4">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
