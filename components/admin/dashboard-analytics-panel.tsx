"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardAnalytics } from "@/components/admin/dashboard-analytics";
import { DATE_RANGE_PRESETS, DATE_RANGE_LABELS, type DateRangePreset } from "@/lib/admin/date-ranges";
import type { DashboardAnalytics as DashboardAnalyticsData } from "@/lib/admin/dashboard-stats";

async function fetchAnalytics(params: {
  preset: DateRangePreset;
  from: string;
  to: string;
}): Promise<{ analytics: DashboardAnalyticsData; rangeLabel: string }> {
  const searchParams = new URLSearchParams({ preset: params.preset });
  if (params.preset === "custom") {
    if (params.from) searchParams.set("from", params.from);
    if (params.to) searchParams.set("to", params.to);
  }
  const res = await fetch(`/api/admin/dashboard/analytics?${searchParams.toString()}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json.data;
}

export function DashboardAnalyticsPanel({
  initialAnalytics,
}: {
  initialAnalytics: DashboardAnalyticsData;
}) {
  const [preset, setPreset] = useState<DateRangePreset>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const isDefaultQuery = preset === "all";

  const { data } = useQuery({
    queryKey: ["admin", "dashboard-analytics", { preset, customFrom, customTo }],
    queryFn: () => fetchAnalytics({ preset, from: customFrom, to: customTo }),
    initialData: isDefaultQuery
      ? { analytics: initialAnalytics, rangeLabel: DATE_RANGE_LABELS.all }
      : undefined,
    enabled: preset !== "custom" || Boolean(customFrom && customTo),
  });

  const analytics = data?.analytics ?? initialAnalytics;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={preset} onValueChange={(value) => setPreset((value as DateRangePreset) ?? "all")}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue>{(value: DateRangePreset) => DATE_RANGE_LABELS[value] ?? value}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_PRESETS.map((option) => (
              <SelectItem key={option} value={option}>
                {DATE_RANGE_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {preset === "custom" && (
          <>
            <DatePicker value={customFrom} onChange={setCustomFrom} placeholder="From" />
            <span className="text-sm text-muted-foreground">to</span>
            <DatePicker value={customTo} onChange={setCustomTo} placeholder="To" />
          </>
        )}

        {data?.rangeLabel && (
          <p className="text-sm text-muted-foreground">Showing {data.rangeLabel}</p>
        )}
      </div>

      <DashboardAnalytics
        bookingStatusBreakdown={analytics.bookingStatusBreakdown}
        invoiceStatusBreakdown={analytics.invoiceStatusBreakdown}
        categoryRevenue={analytics.categoryRevenue}
        topProducts={analytics.topProducts}
        monthlyTrend={analytics.monthlyTrend}
      />
    </div>
  );
}
