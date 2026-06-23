import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                i < current
                  ? "bg-brand-green text-white"
                  : i === current
                    ? "bg-brand-gold text-brand-green"
                    : "bg-[var(--input-bg)] text-[var(--muted)] border border-[var(--border)]"
              )}
            >
              {i < current ? <Check size={14} /> : i + 1}
            </div>
            <span
              className={cn(
                "text-xs font-medium hidden sm:inline",
                i <= current ? "text-[var(--text)]" : "text-[var(--muted)]"
              )}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "w-8 h-0.5 rounded-full",
                i < current ? "bg-brand-green" : "bg-[var(--border)]"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
