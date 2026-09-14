import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCompactNumber(value?: number | null) {
  const number = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    notation: Math.abs(number) >= 100000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(number);
}

export function safeDateLabel(value?: string | null) {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

