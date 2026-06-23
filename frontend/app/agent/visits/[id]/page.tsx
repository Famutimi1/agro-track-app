"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Clock, User, Camera, Check,
  AlertCircle, Loader2, Navigation, CheckCircle, Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";

const mockVisit = {
  id: "V002",
  farmer: "Amina Bello",
  farmerId: "FRM-2025-142",
  phone: "+234 803 222 3333",
  location: "Birnin Kebbi",
  coordinates: { lat: "12.4539", lng: "4.1975" },
  type: "Farm Mapping",
  scheduledDate: "2025-06-23",
  scheduledTime: "11:30 AM",
  status: "IN_PROGRESS",
  distance: "5.1 km",
  farmSize: 3.0,
  crop: "Rice",
  purpose: "Map farm boundaries and verify crop status for loan disbursement",
};

const healthOptions = ["Excellent", "Good", "Fair", "Poor"];
const growthOptions = ["Germination", "Vegetative", "Flowering", "Maturity"];

export default function VisitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState({
    cropHealth: "",
    growthStage: "",
    estimatedYield: "",
    issues: "",
    recommendations: "",
    boundaryMapped: false,
    photosTaken: 0,
    notes: "",
  });

  const isCompleted = mockVisit.status === "COMPLETED";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    alert("Visit report submitted successfully!");
    router.push("/agent/visits");
  };

  const isValid = report.cropHealth && report.growthStage;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/agent/visits" className="p-2 hover:bg-[var(--surface)] rounded-lg">
          <ArrowLeft size={20} className="text-[var(--muted)]" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--text)]">Visit: {mockVisit.farmer}</h1>
          <p className="text-sm text-[var(--muted)]">{mockVisit.type} • {mockVisit.scheduledDate}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
          isCompleted
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
        }`}>
          {isCompleted ? "Completed" : "In Progress"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Visit Info */}
        <div className="col-span-2 space-y-6">
          {/* Farmer Details */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Farmer Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-semibold">
                  {mockVisit.farmer.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text)]">{mockVisit.farmer}</p>
                  <p className="text-sm text-[var(--muted)]">{mockVisit.farmerId}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <MapPin size={14} />
                  <span>{mockVisit.location}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <Leaf size={14} />
                  <span>{mockVisit.farmSize} ha • {mockVisit.crop}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visit Report Form */}
          {!isCompleted && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Visit Report</h2>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Crop Health *</label>
                    <select
                      value={report.cropHealth}
                      onChange={e => setReport({ ...report, cropHealth: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg"
                      required
                    >
                      <option value="">Select health status</option>
                      {healthOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Growth Stage *</label>
                    <select
                      value={report.growthStage}
                      onChange={e => setReport({ ...report, growthStage: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg"
                      required
                    >
                      <option value="">Select growth stage</option>
                      {growthOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Estimated Yield (tons)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={report.estimatedYield}
                      onChange={e => setReport({ ...report, estimatedYield: e.target.value })}
                      placeholder="e.g., 2.5"
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={report.boundaryMapped}
                        onChange={e => setReport({ ...report, boundaryMapped: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-[var(--text)]">Farm boundary mapped</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Issues Observed</label>
                    <textarea
                      value={report.issues}
                      onChange={e => setReport({ ...report, issues: e.target.value })}
                      placeholder="Describe any pest, disease, or environmental issues..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Recommendations</label>
                    <textarea
                      value={report.recommendations}
                      onChange={e => setReport({ ...report, recommendations: e.target.value })}
                      placeholder="Provide recommendations for the farmer..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Capture */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                  <Camera size={20} className="text-orange-600" /> Photo Evidence
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="aspect-square border border-dashed border-[var(--border)] rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-orange-400 transition-colors"
                    >
                      <Camera size={24} className="text-[var(--muted)] mb-2" />
                      <p className="text-xs text-[var(--muted)]">
                        {i === 1 ? "Crop close-up" : i === 2 ? "Farm overview" : "Boundary marker"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <Link href="/agent/visits" className="flex-1">
                  <Button type="button" variant="secondary" className="w-full">
                    Save Draft
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!isValid || submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <><Loader2 size={16} className="mr-2 animate-spin" /> Submitting...</>
                  ) : (
                    <><CheckCircle size={16} className="mr-2" /> Complete Visit</>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Completed Report View */}
          {isCompleted && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Visit Report</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[var(--muted)]">Crop Health</p>
                    <p className="font-medium text-[var(--text)]">Good</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted)]">Growth Stage</p>
                    <p className="font-medium text-[var(--text)]">Vegetative</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted)]">Estimated Yield</p>
                    <p className="font-medium text-[var(--text)]">2.8 tons</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted)]">Boundary Mapped</p>
                    <p className="font-medium text-green-600">Yes</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)]">Notes</p>
                  <p className="text-[var(--text)]">Crops are healthy. Recommended applying additional fertilizer before flowering stage.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Visit Purpose */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--text)] mb-3">Visit Purpose</h3>
            <p className="text-sm text-[var(--muted)]">{mockVisit.purpose}</p>
          </div>

          {/* Location */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--text)] mb-3">Location</h3>
            <div className="aspect-video bg-[var(--background)] rounded-lg mb-3 flex items-center justify-center">
              <MapPin size={32} className="text-[var(--muted)]" />
            </div>
            <p className="text-sm text-[var(--muted)] mb-2">{mockVisit.location}</p>
            <p className="text-xs text-[var(--muted)]">{mockVisit.coordinates.lat}, {mockVisit.coordinates.lng}</p>
            <Button variant="secondary" className="w-full mt-3">
              <Navigation size={14} className="mr-2" /> Open in Maps
            </Button>
          </div>

          {/* Checklist */}
          {!isCompleted && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-5">
              <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-3">Visit Checklist</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { label: "Verify farmer identity", done: true },
                  { label: "Inspect crop health", done: false },
                  { label: "Map farm boundaries", done: false },
                  { label: "Take photos", done: false },
                  { label: "Complete report", done: false },
                ].map((item, i) => (
                  <li key={i} className={`flex items-center gap-2 ${item.done ? "text-green-600" : "text-orange-700 dark:text-orange-400"}`}>
                    {item.done ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span className={item.done ? "line-through" : ""}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
