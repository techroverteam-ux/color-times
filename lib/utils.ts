import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Escapes regex special characters so a string can be used as a literal match pattern. */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Formats a date as "10-Jul-2026". */
export function formatDate(value: string | number | Date): string {
  const date = new Date(value)
  const day = String(date.getDate()).padStart(2, "0")
  const month = date.toLocaleDateString("en-IN", { month: "short" })
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

/** Formats a date with time as "10-Jul-2026, 2:30 PM". */
export function formatDateTime(value: string | number | Date): string {
  const date = new Date(value)
  const time = date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
  return `${formatDate(date)}, ${time}`
}

/** Inclusive day count between two dates (same-day rentals count as 1 day). */
export function daysBetween(from: string | Date, to: string | Date): number {
  if (!from || !to) return 0
  const start = new Date(from)
  const end = new Date(to)
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(1, diff + 1)
}
