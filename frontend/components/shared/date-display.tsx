"use client";

import { formatDistanceToNow, format, isValid, parseISO } from "date-fns";

interface DateDisplayProps {
  date: string | Date | undefined | null;
  format?: "full" | "short" | "relative" | "datetime";
  className?: string;
  fallback?: string;
}

export function DateDisplay({
  date,
  format: formatType = "short",
  className = "",
  fallback = "-",
}: DateDisplayProps) {
  if (!date) return <span className={className}>{fallback}</span>;

  const dateObj = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(dateObj)) return <span className={className}>{fallback}</span>;

  let formatted: string;

  switch (formatType) {
    case "full":
      formatted = format(dateObj, "MMMM d, yyyy");
      break;
    case "datetime":
      formatted = format(dateObj, "MMM d, yyyy h:mm a");
      break;
    case "relative":
      formatted = formatDistanceToNow(dateObj, { addSuffix: true });
      break;
    case "short":
    default:
      formatted = format(dateObj, "MMM d, yyyy");
  }

  return (
    <time dateTime={dateObj.toISOString()} className={className} title={format(dateObj, "PPpp")}>
      {formatted}
    </time>
  );
}

export function formatDate(date: string | Date | null | undefined, formatStr = "MMM d, yyyy"): string {
  if (!date) return "-";
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(dateObj)) return "-";
  return format(dateObj, formatStr);
}

export function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(dateObj)) return "-";
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function isOverdue(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(dateObj)) return false;
  return dateObj < new Date();
}

export function daysUntil(date: string | Date | null | undefined): number | null {
  if (!date) return null;
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(dateObj)) return null;
  const diff = dateObj.getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
