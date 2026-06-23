"use client";

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  locale?: string;
  showSign?: boolean;
  className?: string;
}

export function CurrencyDisplay({
  amount,
  currency = "NGN",
  locale = "en-NG",
  showSign = false,
  className = "",
}: CurrencyDisplayProps) {
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  const sign = showSign && amount > 0 ? "+" : amount < 0 ? "-" : "";
  const color = showSign ? (amount > 0 ? "text-green-600" : amount < 0 ? "text-red-600" : "") : "";

  return <span className={`${color} ${className}`}>{sign}{formatted}</span>;
}

export function formatCurrency(amount: number, currency = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-NG").format(num);
}

export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}
