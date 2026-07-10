import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ServiceOrderStatus } from "@/models/ServiceOrder";

const STATUS_STYLES: Record<ServiceOrderStatus, string> = {
  pending: "bg-secondary text-foreground",
  in_progress: "bg-blue-100 text-blue-800",
  quality_check: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<ServiceOrderStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  quality_check: "Quality Check",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function ServiceOrderStatusBadge({ status }: { status: ServiceOrderStatus }) {
  return (
    <Badge className={cn("rounded-full border-none font-medium", STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
