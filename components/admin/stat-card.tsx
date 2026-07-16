import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatTint = "wine" | "gold" | "teal" | "rose" | "slate";

const TINT_CLASSES: Record<StatTint, string> = {
  wine: "bg-chart-1/10 text-chart-1",
  gold: "bg-chart-2/15 text-chart-2",
  teal: "bg-chart-3/12 text-chart-3",
  rose: "bg-chart-4/12 text-chart-4",
  slate: "bg-chart-5/12 text-chart-5",
};

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  tint?: StatTint;
  delta?: { label: string; trend: "up" | "down" };
}

export function StatCard({ label, value, icon: Icon, hint, tint = "gold", delta }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", TINT_CLASSES[tint])}>
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
      </div>
      <p className="mt-3 font-heading text-3xl">{value}</p>
      {delta ? (
        <p
          className={cn(
            "mt-1 flex items-center gap-1 text-xs font-medium",
            delta.trend === "up" ? "text-chart-3" : "text-chart-4"
          )}
        >
          {delta.trend === "up" ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {delta.label}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
