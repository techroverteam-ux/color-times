import { Button } from "@/components/ui/button";

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
}

export function AdminPagination({
  page,
  totalPages,
  total,
  itemLabel = "results",
  onPageChange,
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages} &middot; {total} {itemLabel}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 sm:flex-initial"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 sm:flex-initial"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
