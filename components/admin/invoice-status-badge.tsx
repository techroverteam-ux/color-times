import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/models/Invoice";

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: "bg-secondary text-foreground",
  sent: "bg-blue-100 text-blue-800",
  partially_paid: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-slate-200 text-slate-700",
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  partially_paid: "Partially Paid",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge className={cn("rounded-full border-none font-medium", STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
