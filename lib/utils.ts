import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
