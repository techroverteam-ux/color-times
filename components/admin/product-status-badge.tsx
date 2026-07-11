import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/models/Product";

const STATUS_STYLES: Record<ProductStatus, string> = {
  available: "bg-emerald-100 text-emerald-800",
  booked: "bg-blue-100 text-blue-800",
  under_dry_cleaning: "bg-amber-100 text-amber-800",
  under_repair: "bg-orange-100 text-orange-800",
  returned: "bg-slate-200 text-slate-700",
};

const STATUS_LABELS: Record<ProductStatus, string> = {
  available: "Available",
  booked: "Booked",
  under_dry_cleaning: "Under Dry Cleaning",
  under_repair: "Under Repair",
  returned: "Returned",
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return (
    <Badge className={cn("rounded-full border-none font-medium", STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
