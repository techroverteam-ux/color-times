"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { formatDate } from "@/lib/utils";
import type { BookingStatus } from "@/models/Booking";

interface QuickViewBooking {
  _id: string;
  bookingNumber: string;
  status: BookingStatus;
  customer: { name: string; email: string; phone?: string } | null;
  items: { product: { name: string; sku: string } | null; size: string; quantity: number }[];
  rentalStartDate: string;
  rentalEndDate: string;
  eventDate: string;
  totalAmount: number;
}

function formatCurrency(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

async function fetchBooking(id: string): Promise<QuickViewBooking> {
  const res = await fetch(`/api/admin/bookings/${id}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json.data.booking;
}

export function BookingQuickViewDialog({
  bookingId,
  onOpenChange,
}: {
  bookingId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: booking, isLoading } = useQuery({
    queryKey: ["admin", "booking", bookingId],
    queryFn: () => fetchBooking(bookingId as string),
    enabled: Boolean(bookingId),
  });

  return (
    <Dialog open={bookingId !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isLoading || !booking ? "Booking" : booking.bookingNumber}
          </DialogTitle>
        </DialogHeader>

        {isLoading || !booking ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <BookingStatusBadge status={booking.status} />
              <p className="text-sm font-medium">{formatCurrency(booking.totalAmount)}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Customer
              </p>
              <p className="mt-1 text-sm">{booking.customer?.name ?? "—"}</p>
              {booking.customer?.phone && (
                <p className="text-xs text-muted-foreground">{booking.customer.phone}</p>
              )}
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {booking.items.length > 1 ? `Items (${booking.items.length})` : "Item"}
              </p>
              <div className="mt-1 space-y-1">
                {booking.items.map((item, index) => (
                  <p key={index} className="text-sm">
                    {item.product?.name ?? "—"}
                    <span className="text-xs text-muted-foreground">
                      {" "}
                      &middot; Size {item.size}
                      {item.quantity > 1 && ` ×${item.quantity}`}
                    </span>
                  </p>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Dates
              </p>
              <p className="mt-1 text-sm">
                {formatDate(booking.rentalStartDate)} &rarr; {formatDate(booking.rentalEndDate)}
              </p>
              <p className="text-xs text-muted-foreground">
                Event {formatDate(booking.eventDate)}
              </p>
            </div>

            <ButtonLink
              href={`/admin/bookings/${booking._id}`}
              variant="outline"
              className="w-full"
            >
              View full booking <ArrowUpRight className="h-3.5 w-3.5" />
            </ButtonLink>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
