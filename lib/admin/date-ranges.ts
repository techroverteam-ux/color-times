import { formatDate } from "@/lib/utils";

export const DATE_RANGE_PRESETS = [
  "all",
  "today",
  "week",
  "month",
  "last_month",
  "last_month_to_date",
  "year",
  "custom",
] as const;

export type DateRangePreset = (typeof DATE_RANGE_PRESETS)[number];

export const DATE_RANGE_LABELS: Record<DateRangePreset, string> = {
  all: "All Time",
  today: "Today",
  week: "This Week",
  month: "This Month",
  last_month: "Last Month",
  last_month_to_date: "Last Month to Date",
  year: "This Year",
  custom: "Custom Range",
};

export interface ResolvedDateRange {
  from: Date | null;
  to: Date | null;
  label: string;
}

export function resolveDateRange(
  preset: DateRangePreset,
  customFrom?: string | null,
  customTo?: string | null
): ResolvedDateRange {
  const now = new Date();

  switch (preset) {
    case "all":
      return { from: null, to: null, label: DATE_RANGE_LABELS.all };

    case "today": {
      const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      return { from, to, label: DATE_RANGE_LABELS.today };
    }

    case "week": {
      const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      return { from, to: null, label: DATE_RANGE_LABELS.week };
    }

    case "month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return {
        from,
        to,
        label: from.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      };
    }

    case "last_month": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        from,
        to,
        label: from.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      };
    }

    case "last_month_to_date": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      return {
        from,
        to,
        label: `${from.toLocaleDateString("en-IN", { month: "short", year: "numeric" })} – ${formatDate(now)}`,
      };
    }

    case "year": {
      const from = new Date(now.getFullYear(), 0, 1);
      const to = new Date(now.getFullYear() + 1, 0, 1);
      return { from, to, label: String(now.getFullYear()) };
    }

    case "custom": {
      const from = customFrom ? new Date(customFrom) : null;
      const to = customTo ? new Date(customTo) : null;
      if (to) to.setHours(23, 59, 59, 999);
      return { from, to, label: DATE_RANGE_LABELS.custom };
    }

    default:
      return { from: null, to: null, label: DATE_RANGE_LABELS.all };
  }
}

export function buildDateFilter(field: string, range: ResolvedDateRange): Record<string, unknown> {
  if (!range.from && !range.to) return {};
  const condition: Record<string, Date> = {};
  if (range.from) condition.$gte = range.from;
  if (range.to) condition.$lt = range.to;
  return { [field]: condition };
}
