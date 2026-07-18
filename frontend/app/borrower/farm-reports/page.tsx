"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { Camera, Check, X } from "lucide-react";
import { useMyFarmReports, useCreateFarmReport, useUploadFarmReportPhotos } from "@/lib/hooks";

const MAX_PHOTOS = 5;

function getCurrentPosition(): Promise<{ latitude: number; longitude: number } | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return Promise.resolve(null);

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => resolve(null),
      { timeout: 8000 }
    );
  });
}

const CROP_STAGES = [
  { value: "PLANTING", label: "Planting" },
  { value: "GERMINATION", label: "Germination" },
  { value: "VEGETATIVE", label: "Vegetative Growth" },
  { value: "FLOWERING", label: "Flowering" },
  { value: "FRUITING", label: "Fruiting / Grain Filling" },
  { value: "HARVEST", label: "Harvest" },
  { value: "POST_HARVEST", label: "Post-Harvest" },
];

const CHALLENGES = [
  "None (Good progress)",
  "Pests",
  "Drought",
  "Flooding",
  "Labour shortage",
  "Input shortage",
  "Disease",
  "Other",
];
const PEST_CHALLENGES = ["Pests", "Disease"];

function statusBadgeClass(status: string) {
  if (status === "VERIFIED") return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400";
  if (status === "REJECTED") return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400";
  return "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400";
}

function statusLabel(status: string) {
  if (status === "VERIFIED") return "Verified";
  if (status === "REJECTED") return "Rejected";
  return "Pending";
}

export default function FarmReportsPage() {
  const { data, isLoading } = useMyFarmReports();
  const createReport = useCreateFarmReport();
  const uploadPhotos = useUploadFarmReportPhotos();

  const [cropStage, setCropStage] = useState(CROP_STAGES[2].value);
  const [yieldEstimate, setYieldEstimate] = useState("");
  const [notes, setNotes] = useState("");
  const [challenges, setChallenges] = useState<string[]>([]);
  const [otherChallenge, setOtherChallenge] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pastReports = data?.data || [];
  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const handlePhotosSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    const combined = [...photos, ...files].slice(0, MAX_PHOTOS);
    setPhotos(combined);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  const removePhoto = (index: number) => {
    const nextPhotos = photos.filter((_, i) => i !== index);
    setPhotos(nextPhotos);
    setPreviews(nextPhotos.map((f) => URL.createObjectURL(f)));
  };

  const toggleChallenge = (challenge: string) => {
    setChallenges((prev) => {
      // "None" is exclusive — selecting it clears everything else, and vice versa.
      if (challenge === "None (Good progress)") return prev.includes(challenge) ? [] : [challenge];
      const withoutNone = prev.filter((c) => c !== "None (Good progress)");
      return withoutNone.includes(challenge)
        ? withoutNone.filter((c) => c !== challenge)
        : [...withoutNone, challenge];
    });
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const [position, uploaded] = await Promise.all([
        getCurrentPosition(),
        photos.length > 0 ? uploadPhotos.mutateAsync(photos) : Promise.resolve(null),
      ]);

      const challengeLabels = challenges.map((c) =>
        c === "Other" && otherChallenge.trim() ? `Other: ${otherChallenge.trim()}` : c
      );
      const hasRealChallenges =
        challengeLabels.length > 0 && !challengeLabels.includes("None (Good progress)");

      const description = [
        yieldEstimate ? `Estimated yield: ${yieldEstimate}kg` : null,
        notes || null,
        hasRealChallenges ? `Challenges: ${challengeLabels.join(", ")}` : null,
      ]
        .filter(Boolean)
        .join(". ");

      const pestSelected = challenges.some((c) => PEST_CHALLENGES.includes(c));

      await createReport.mutateAsync({
        type: "MONTHLY_UPDATE",
        title: `Monthly Farm Report - ${monthLabel}`,
        description: description || undefined,
        cropStage,
        images: uploaded?.urls,
        latitude: position?.latitude,
        longitude: position?.longitude,
        pestPresent: pestSelected || undefined,
        pestDetails: pestSelected
          ? challenges.filter((c) => PEST_CHALLENGES.includes(c)).join(", ")
          : undefined,
      });

      setJustSubmitted(true);
      setYieldEstimate("");
      setNotes("");
      setChallenges([]);
      setOtherChallenge("");
      setPhotos([]);
      setPreviews([]);
    } catch {
      setSubmitError("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h3 className="text-sm font-bold text-[var(--text)] mb-3">{monthLabel} Report</h3>
          <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-brand-green/10 text-[var(--text)]">
            <span className="text-sm">🔓</span>
            <p className="text-[11px] leading-relaxed text-[var(--muted)]">
              A verified report keeps your FarmScore active and unlocks the next disbursement layer on your
              loan. Add clear crop photos so your field agent can verify quickly.
            </p>
          </div>
          {!justSubmitted ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">
                  Crop Stage
                </label>
                <select
                  value={cropStage}
                  onChange={(e) => setCropStage(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-sm text-[var(--text)]"
                >
                  {CROP_STAGES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">
                  Estimated Yield (kg)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 3500"
                  value={yieldEstimate}
                  onChange={(e) => setYieldEstimate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">
                  Notes
                </label>
                <Textarea
                  rows={3}
                  placeholder="Any observations about crop health, weather, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">
                  Challenges / Issues
                </label>
                <div className="flex flex-wrap gap-2">
                  {CHALLENGES.map((c) => {
                    const active = challenges.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleChallenge(c)}
                        className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                          active
                            ? "bg-brand-green text-white border-brand-green"
                            : "bg-[var(--input-bg)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
                {challenges.includes("Other") && (
                  <Input
                    className="mt-2"
                    placeholder="Describe the issue"
                    value={otherChallenge}
                    onChange={(e) => setOtherChallenge(e.target.value)}
                  />
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">
                  Farm Photos ({photos.length}/{MAX_PHOTOS})
                </label>
                {previews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {previews.map((src, i) => (
                      <div key={src} className="relative aspect-square rounded-lg overflow-hidden border border-[var(--border)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Farm photo ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {photos.length < MAX_PHOTOS && (
                  <label className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center block cursor-pointer">
                    <Camera size={24} className="mx-auto text-[var(--muted)] mb-2" />
                    <p className="text-xs text-[var(--muted)]">Tap to add photos (JPEG/PNG, up to {MAX_PHOTOS})</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      multiple
                      className="hidden"
                      onChange={handlePhotosSelected}
                    />
                  </label>
                )}
              </div>
              {(createReport.isError || uploadPhotos.isError || submitError) && (
                <p className="text-xs text-red-500">
                  {submitError || "Failed to submit report. Please try again."}
                </p>
              )}
              <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting…" : "Submit Report"}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-14 h-14 mx-auto bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
                <Check size={24} className="text-green-600" />
              </div>
              <h4 className="text-base font-bold text-[var(--text)] mb-1">Report Submitted!</h4>
              <p className="text-xs text-[var(--muted)]">
                Your report is pending review. FarmScore updates once it&apos;s verified.
              </p>
              <Button className="mt-4" variant="secondary" onClick={() => setJustSubmitted(false)}>
                Submit Another
              </Button>
            </div>
          )}
        </Card>

        {/* Past Reports */}
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">Report History</h3>
          {isLoading ? (
            <p className="text-xs text-[var(--muted)] text-center py-6">Loading…</p>
          ) : pastReports.length === 0 ? (
            <p className="text-xs text-[var(--muted)] text-center py-6">
              No reports submitted yet
            </p>
          ) : (
            <div className="space-y-3">
              {pastReports.map((r: any) => {
                const verifier = r.verifiedBy || r.verifier || r.reviewedBy;
                const verifierName = verifier
                  ? `${verifier.firstName ?? ""} ${verifier.lastName ?? ""}`.trim()
                  : null;
                const verifiedAt = r.verifiedAt || r.reviewedAt;
                return (
                  <div key={r.id} className="py-3 border-b border-[var(--border)] last:border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-[var(--text)]">{r.title}</p>
                        <p className="text-[11px] text-[var(--muted)]">
                          Submitted{" "}
                          {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusBadgeClass(r.status)}`}>
                        {statusLabel(r.status)}
                      </span>
                    </div>
                    {r.status === "VERIFIED" && (verifierName || verifiedAt) && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-green-600">
                        <Check size={12} />
                        <span>
                          Verified{verifierName ? ` by ${verifierName}` : ""}
                          {verifiedAt
                            ? ` · ${new Date(verifiedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                            : ""}
                        </span>
                      </div>
                    )}
                    {r.status === "REJECTED" && (r.rejectionReason || r.reviewNotes) && (
                      <div className="flex items-start gap-1.5 mt-1.5 text-[11px] text-red-600">
                        <X size={12} className="mt-0.5 flex-shrink-0" />
                        <span>{r.rejectionReason || r.reviewNotes}</span>
                      </div>
                    )}
                    {r.status === "PENDING" && (
                      <p className="text-[11px] text-[var(--muted)] mt-1.5">
                        Awaiting field-agent verification
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
