import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CustomisationOrderStatus } from "@/models/CustomisationOrder";

const STATUS_STYLES: Record<CustomisationOrderStatus, string> = {
  pending: "bg-secondary text-foreground",
  in_progress: "bg-blue-100 text-blue-800",
  ready: "bg-amber-100 text-amber-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<CustomisationOrderStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  ready: "Ready",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function CustomisationStatusBadge({ status }: { status: CustomisationOrderStatus }) {
  return (
    <Badge className={cn("rounded-full border-none font-medium", STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
