"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { BookingCalendar } from "@/components/admin/booking-calendar";
import { cn, formatDate } from "@/lib/utils";
import type { BookingStatus } from "@/models/Booking";

interface BookingRow {
  _id: string;
  bookingNumber: string;
  status: BookingStatus;
  rentalStartDate: string;
  rentalEndDate: string;
  totalAmount: number;
  customer: { name: string; email: string } | null;
  product: { name: string } | null;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "inquiry", label: "Inquiry" },
  { value: "pending_payment", label: "Pending Payment" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_use", label: "In Use" },
  { value: "returned", label: "Returned" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_OPTIONS: BookingStatus[] = [
  "inquiry",
  "pending_payment",
  "confirmed",
  "in_use",
  "returned",
  "cancelled",
];

async function fetchBookings(params: {
  page: number;
  status: string;
}): Promise<{ bookings: BookingRow[]; pagination: Pagination }> {
  const searchParams = new URLSearchParams({ page: String(params.page) });
  if (params.status !== "all") searchParams.set("status", params.status);

  const res = await fetch(`/api/admin/bookings?${searchParams.toString()}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json.data;
}

export function BookingsClient({
  initialBookings,
  initialPagination,
}: {
  initialBookings: BookingRow[];
  initialPagination: Pagination;
}) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [view, setView] = useState<"table" | "calendar">("table");

  const isDefaultQuery = page === 1 && status === "all";

  const { data } = useQuery({
    queryKey: ["admin", "bookings", { page, status }],
    queryFn: () => fetchBookings({ page, status }),
    initialData: isDefaultQuery
      ? { bookings: initialBookings, pagination: initialPagination }
      : undefined,
  });

  const bookings = data?.bookings ?? [];
  const pagination = data?.pagination ?? initialPagination;

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status: newStatus,
    }: {
      id: string;
      status: BookingStatus;
    }) => {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data.booking;
    },
    onSuccess: () => {
      toast.success("Booking status updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value ?? "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue>
                {(value: string) =>
                  STATUS_FILTERS.find((option) => option.value === value)?.label ?? value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex shrink-0 rounded-md border border-border p-0.5">
            <button
              type="button"
              onClick={() => setView("table")}
              className={cn(
                "flex items-center gap-1.5 rounded px-2.5 py-1.5 text-sm",
                view === "table"
                  ? "bg-secondary font-medium"
                  : "text-muted-foreground",
              )}
            >
              <List className="h-4 w-4" /> Table
            </button>
            <button
              type="button"
              onClick={() => setView("calendar")}
              className={cn(
                "flex items-center gap-1.5 rounded px-2.5 py-1.5 text-sm",
                view === "calendar"
                  ? "bg-secondary font-medium"
                  : "text-muted-foreground",
              )}
            >
              <CalendarDays className="h-4 w-4" /> Calendar
            </button>
          </div>
        </div>
        {view === "table" && (
          <p className="text-sm text-muted-foreground">
            {pagination.total} bookings
          </p>
        )}
      </div>

      {view === "calendar" ? (
        <BookingCalendar />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Booking #</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Update</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">
                      {booking.bookingNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p>{booking.customer?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.customer?.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {booking.product?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(booking.rentalStartDate)} &rarr;{" "}
                      {formatDate(booking.rentalEndDate)}
                    </td>
                    <td className="px-4 py-3">
                      &#8377;{booking.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <BookingStatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={booking.status}
                        onValueChange={(value) => {
                          if (value && value !== booking.status) {
                            updateStatusMutation.mutate({
                              id: booking._id,
                              status: value as BookingStatus,
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="ml-auto w-40" size="sm">
                          <SelectValue>
                            {(value: string) => value.replace("_", " ")}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
