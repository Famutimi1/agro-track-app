"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  on: boolean;
  onToggle: () => void;
  className?: string;
}

export function Toggle({ on, onToggle, className }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative w-[46px] h-[26px] rounded-full border-2 transition-colors duration-250 cursor-pointer flex-shrink-0",
        on
          ? "bg-brand-green border-green-600"
          : "bg-gray-600 border-gray-500",
        className
      )}
    >
      <div
        className={cn(
          "absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-md transition-[left] duration-250",
          on ? "left-[22px]" : "left-[2px]"
        )}
      />
    </button>
  );
}
