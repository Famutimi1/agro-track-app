import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function clamp(min: number, max: number): string {
  return `clamp(${min}px, 4vw, ${max}px)`;
}

// Compact naira formatter: ₦18.4B, ₦142M, ₦750K.
export function formatCompactCurrency(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1e9) return `₦${(amount / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `₦${(amount / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `₦${(amount / 1e3).toFixed(1)}K`;
  return `₦${amount.toFixed(0)}`;
}

// Compact plain-number formatter: 87.3K, 1.2M.
export function formatCompactNumber(num: number): string {
  const abs = Math.abs(num);
  if (abs >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return `${num}`;
}

export function computeProgramMatch(
  program: { requiredScore?: number; targetCrops?: string[]; targetStates?: string[] },
  profile?: { farmScore: number; primaryCrop?: string; secondaryCrops?: string[]; state?: string }
): number {
  if (!profile) return 50;

  let score = 0;

  const requiredScore = program.requiredScore || 0;
  if (requiredScore <= 0 || profile.farmScore >= requiredScore) {
    score += 40;
  } else {
    score += Math.max(0, Math.round((profile.farmScore / requiredScore) * 40));
  }

  const crops = [profile.primaryCrop, ...(profile.secondaryCrops || [])].filter(Boolean) as string[];
  if (!program.targetCrops?.length || program.targetCrops.some((c) => crops.includes(c))) {
    score += 30;
  }

  if (!program.targetStates?.length || (profile.state && program.targetStates.includes(profile.state))) {
    score += 30;
  }

  return Math.min(100, Math.max(0, score));
}
