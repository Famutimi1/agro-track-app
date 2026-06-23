"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar, MapPin, Clock, CheckCircle, Navigation,
  Filter, ChevronRight, AlertTriangle, User
} from "lucide-react";
import { Button } from "@/components/ui/button";

const mockVisits = [
  { id: "V001", farmer: "Musa Garba", farmerId: "FRM-2025-140", location: "Argungu, Kebbi", type: "Verification", scheduledDate: "2025-06-23", scheduledTime: "9:00 AM", status: "COMPLETED", distance: "2.3 km", completedAt: "9:45 AM" },
  { id: "V002", farmer: "Amina Bello", farmerId: "FRM-2025-142", location: "Birnin Kebbi", type: "Farm Mapping", scheduledDate: "2025-06-23", scheduledTime: "11:30 AM", status: "IN_PROGRESS", distance: "5.1 km", completedAt: null },
  { id: "V003", farmer: "Ibrahim Sule", farmerId: "FRM-2025-143", location: "Kalgo, Kebbi", type: "Monitoring", scheduledDate: "2025-06-23", scheduledTime: "2:00 PM", status: "PENDING", distance: "8.7 km", completedAt: null },
  { id: "V004", farmer: "Fatima Yusuf", farmerId: "FRM-2025-144", location: "Gwandu, Kebbi", type: "Verification", scheduledDate: "2025-06-23", scheduledTime: "4:00 PM", status: "PENDING", distance: "12.4 km", completedAt: null },
  { id: "V005", farmer: "Yusuf Abubakar", farmerId: "FRM-2025-138", location: "Jega, Kebbi", type: "Disbursement", scheduledDate: "2025-06-24", scheduledTime: "9:00 AM", status: "PENDING", distance: "15.2 km", completedAt: null },
  { id: "V006", farmer: "Halima Mohammed", farmerId: "FRM-2025-135", location: "Argungu, Kebbi", type: "Monitoring", scheduledDate: "2025-06-24", scheduledTime: "11:00 AM", status: "PENDING", distance: "3.1 km", completedAt: null },
  { id: "V007", farmer: "Sani Garba", farmerId: "FRM-2025-130", location: "Birnin Kebbi", type: "Verification", scheduledDate: "2025-06-22", scheduledTime: "10:00 AM", status: "COMPLETED", distance: "4.5 km", completedAt: "10:30 AM" },
  { id: "V008", farmer: "Aisha Danladi", farmerId: "FRM-2025-129", location: "Kalgo, Kebbi", type: "Monitoring", scheduledDate: "2025-06-22", scheduledTime: "2:00 PM", status: "MISSED", distance: "9.2 km", completedAt: null },
];

const typeColors: Record<string, string> = {
  "Verification": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Farm Mapping": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "Monitoring": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "Disbursement": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  COMPLETED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", icon: CheckCircle },
  IN_PROGRESS: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400", icon: Navigation },
  PENDING: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", icon: Clock },
  MISSED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: AlertTriangle },
};

export default function AgentVisitsPage() {
  const [dateFilter, setDateFilter] = useState("today");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const today = "2025-06-23";
  const tomorrow = "2025-06-24";
  const yesterday = "2025-06-22";

  const filteredVisits = mockVisits.filter(visit => {
    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" && visit.scheduledDate === today) ||
      (dateFilter === "tomorrow" && visit.scheduledDate === tomorrow) ||
      (dateFilter === "past" && visit.scheduledDate < today);
    const matchesStatus = statusFilter === "ALL" || visit.status === statusFilter;
    return matchesDate && matchesStatus;
  });

  const stats = {
    today: mockVisits.filter(v => v.scheduledDate === today).length,
    completed: mockVisits.filter(v => v.status === "COMPLETED").length,
    pending: mockVisits.filter(v => v.status === "PENDING").length,
    inProgress: mockVisits.filter(v => v.status === "IN_PROGRESS").length,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Scheduled Visits</h1>
          <p className="text-sm text-[var(--muted)]">Manage and track your farm visits</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Today's Visits", value: stats.today, color: "text-orange-600" },
          { label: "In Progress", value: stats.inProgress, color: "text-blue-600" },
          { label: "Completed", value: stats.completed, color: "text-green-600" },
          { label: "Pending", value: stats.pending, color: "text-gray-500" },
        ].map(stat => (
          <div key={stat.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <p className="text-sm text-[var(--muted)] mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex gap-2">
          {[
            { key: "today", label: "Today" },
            { key: "tomorrow", label: "Tomorrow" },
            { key: "past", label: "Past" },
            { key: "all", label: "All" },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setDateFilter(opt.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateFilter === opt.key
                  ? "bg-orange-600 text-white"
                  : "bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--background)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="MISSED">Missed</option>
        </select>
      </div>

      {/* Visits List */}
      <div className="space-y-3">
        {filteredVisits.map(visit => {
          const status = statusConfig[visit.status];
          const StatusIcon = status.icon;

          return (
            <div
              key={visit.id}
              className={`bg-[var(--surface)] border rounded-xl p-4 ${
                visit.status === "IN_PROGRESS"
                  ? "border-orange-300 dark:border-orange-800"
                  : "border-[var(--border)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${status.bg}`}>
                    <StatusIcon size={24} className={status.text} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-[var(--text)]">{visit.farmer}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${typeColors[visit.type]}`}>
                        {visit.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {visit.location}
                      </span>
                      <span>{visit.distance}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {visit.scheduledTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                    <StatusIcon size={12} />
                    {visit.status === "IN_PROGRESS" ? "In Progress" : visit.status}
                  </span>

                  {visit.status === "PENDING" && (
                    <Button variant="primary" size="sm" className="bg-orange-600 hover:bg-orange-700">
                      <Navigation size={14} className="mr-1" /> Start
                    </Button>
                  )}

                  {visit.status === "IN_PROGRESS" && (
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm">
                        <Navigation size={14} className="mr-1" /> Navigate
                      </Button>
                      <Link href={`/agent/visits/${visit.id}`}>
                        <Button variant="primary" size="sm" className="bg-green-600 hover:bg-green-700">
                          Complete
                        </Button>
                      </Link>
                    </div>
                  )}

                  {visit.status === "COMPLETED" && (
                    <Link href={`/agent/visits/${visit.id}`}>
                      <Button variant="secondary" size="sm">
                        View Report <ChevronRight size={14} />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {visit.status === "IN_PROGRESS" && (
                <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                  <p className="text-sm text-orange-600">Visit started - waiting for completion report</p>
                  <p className="text-xs text-[var(--muted)]">Started 15 minutes ago</p>
                </div>
              )}

              {visit.status === "MISSED" && (
                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle size={14} />
                    <span>This visit was missed. Please reschedule or contact supervisor.</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredVisits.length === 0 && (
          <div className="text-center py-12 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
            <Calendar size={48} className="mx-auto text-[var(--muted)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text)] mb-2">No visits found</h3>
            <p className="text-[var(--muted)]">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
