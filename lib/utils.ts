import { clsx } from "clsx";

export function cn(...parts: Array<string | false | null | undefined>) {
  return clsx(parts);
}

export function toPercent(value: number) {
  return Math.round(value * 100);
}

export function formatPercent(value: number) {
  return `${toPercent(value)}%`;
}

export function getClinicStatus(scorePercent: number) {
  if (scorePercent >= 80) return { label: "Высокий", className: "status-green" };
  if (scorePercent >= 60) return { label: "Средний", className: "status-yellow" };
  return { label: "Критический", className: "status-red" };
}

export function startOfCurrentDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
