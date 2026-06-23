"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, User, MapPin, Phone, Camera, Upload,
  Check, AlertCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";

const states = ["Kebbi", "Sokoto", "Zamfara", "Katsina", "Kaduna"];
const lgas: Record<string, string[]> = {
  "Kebbi": ["Argungu", "Birnin Kebbi", "Kalgo", "Gwandu", "Jega", "Yauri"],
  "Sokoto": ["Sokoto North", "Sokoto South", "Wamakko", "Bodinga"],
  "Zamfara": ["Gusau", "Kaura Namoda", "Bungudu"],
  "Katsina": ["Katsina", "Funtua", "Daura"],
  "Kaduna": ["Kaduna North", "Kaduna South", "Zaria"],
};

const crops = ["Rice", "Maize", "Cassava", "Vegetables", "Groundnuts", "Sorghum", "Millet", "Cowpea"];

export default function RegisterFarmerPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    bvn: "",
    state: "Kebbi",
    lga: "",
    village: "",
    farmSize: "",
    primaryCrop: "",
    secondaryCrops: [] as string[],
    yearsExperience: "",
    hasIrrigation: false,
    coordinates: { lat: "", lng: "" },
    idPhoto: null as File | null,
    farmPhoto: null as File | null,
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const captureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setFormData(prev => ({
            ...prev,
            coordinates: {
              lat: pos.coords.latitude.toFixed(6),
              lng: pos.coords.longitude.toFixed(6),
            },
          }));
          setLocationCaptured(true);
        },
        err => alert("Unable to get location. Please enable GPS.")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    alert("Farmer registered successfully! Data will sync when online.");
    router.push("/agent/farmers");
  };

  const isValid =
    formData.firstName &&
    formData.lastName &&
    formData.phone &&
    formData.lga &&
    formData.farmSize &&
    formData.primaryCrop &&
    locationCaptured;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/agent/farmers" className="p-2 hover:bg-[var(--surface)] rounded-lg">
          <ArrowLeft size={20} className="text-[var(--muted)]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Register New Farmer</h1>
          <p className="text-sm text-[var(--muted)]">Capture farmer details for credit assessment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
            <User size={20} className="text-orange-600" /> Personal Information
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">First Name *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={e => handleChange("firstName", e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Last Name *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e => handleChange("lastName", e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => handleChange("phone", e.target.value)}
                placeholder="+234 XXX XXX XXXX"
                className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">BVN (Optional)</label>
              <input
                type="text"
                value={formData.bvn}
                onChange={e => handleChange("bvn", e.target.value)}
                placeholder="11-digit Bank Verification Number"
                maxLength={11}
                className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-orange-600" /> Location
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">State *</label>
              <select
                value={formData.state}
                onChange={e => handleChange("state", e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg"
              >
                {states.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">LGA *</label>
              <select
                value={formData.lga}
                onChange={e => handleChange("lga", e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg"
                required
              >
                <option value="">Select LGA</option>
                {(lgas[formData.state] || []).map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Village/Community</label>
              <input
                type="text"
                value={formData.village}
                onChange={e => handleChange("village", e.target.value)}
                placeholder="Enter village or community name"
                className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg"
              />
            </div>
          </div>

          {/* GPS Capture */}
          <div className="p-4 bg-[var(--background)] rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--text)]">GPS Coordinates *</p>
                <p className="text-sm text-[var(--muted)]">
                  {locationCaptured
                    ? `${formData.coordinates.lat}, ${formData.coordinates.lng}`
                    : "Capture the farmer's farm location"}
                </p>
              </div>
              <Button
                type="button"
                variant={locationCaptured ? "secondary" : "primary"}
                onClick={captureLocation}
                className={locationCaptured ? "" : "bg-orange-600 hover:bg-orange-700"}
              >
                {locationCaptured ? (
                  <><Check size={16} className="mr-2 text-green-600" /> Captured</>
                ) : (
                  <><MapPin size={16} className="mr-2" /> Capture Location</>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Farm Details */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Farm Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Farm Size (Hectares) *</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.farmSize}
                onChange={e => handleChange("farmSize", e.target.value)}
                placeholder="e.g., 2.5"
                className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Years of Experience</label>
              <input
                type="number"
                min="0"
                value={formData.yearsExperience}
                onChange={e => handleChange("yearsExperience", e.target.value)}
                placeholder="e.g., 5"
                className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Primary Crop *</label>
              <select
                value={formData.primaryCrop}
                onChange={e => handleChange("primaryCrop", e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg"
                required
              >
                <option value="">Select crop</option>
                {crops.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasIrrigation}
                  onChange={e => handleChange("hasIrrigation", e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-[var(--text)]">Has irrigation system</span>
              </label>
            </div>
          </div>
        </div>

        {/* Photo Capture */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
            <Camera size={20} className="text-orange-600" /> Photos
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-dashed border-[var(--border)] rounded-lg text-center hover:border-orange-400 transition-colors cursor-pointer">
              <Camera size={32} className="mx-auto text-[var(--muted)] mb-2" />
              <p className="font-medium text-[var(--text)]">Farmer ID Photo</p>
              <p className="text-xs text-[var(--muted)]">Take a clear photo of the farmer</p>
              <input type="file" accept="image/*" capture="user" className="hidden" />
            </div>
            <div className="p-4 border border-dashed border-[var(--border)] rounded-lg text-center hover:border-orange-400 transition-colors cursor-pointer">
              <Camera size={32} className="mx-auto text-[var(--muted)] mb-2" />
              <p className="font-medium text-[var(--text)]">Farm Photo</p>
              <p className="text-xs text-[var(--muted)]">Take a photo of the farm/crops</p>
              <input type="file" accept="image/*" capture="environment" className="hidden" />
            </div>
          </div>
        </div>

        {/* Offline Notice */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-700 dark:text-blue-400">Offline Support</p>
              <p className="text-blue-600 dark:text-blue-400">
                This form works offline. Data will be saved locally and synced automatically when you&apos;re back online.
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Link href="/agent/farmers" className="flex-1">
            <Button type="button" variant="secondary" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid || submitting}
            className="flex-1 bg-orange-600 hover:bg-orange-700"
          >
            {submitting ? (
              <><Loader2 size={16} className="mr-2 animate-spin" /> Saving...</>
            ) : (
              <><Check size={16} className="mr-2" /> Register Farmer</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
