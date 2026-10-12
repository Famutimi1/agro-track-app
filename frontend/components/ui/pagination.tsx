"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between gap-3 pt-4 ${className ?? ""}`}>
      <p className="text-xs text-[var(--muted)]">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft size={14} /> Prev
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
