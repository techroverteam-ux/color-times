"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/models/Booking";

interface CalendarBooking {
  _id: string;
  bookingNumber: string;
  status: BookingStatus;
  rentalStartDate: string;
  rentalEndDate: string;
  customer: { name: string } | null;
  product: { name: string } | null;
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

async function fetchCalendarBookings(from: Date, to: Date): Promise<CalendarBooking[]> {
  const searchParams = new URLSearchParams({
    pageSize: "200",
    from: from.toISOString(),
    to: to.toISOString(),
  });
  const res = await fetch(`/api/admin/bookings?${searchParams.toString()}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json.data.bookings;
}

export function BookingCalendar() {
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const monthStart = monthCursor;
  const monthEnd = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);
  const gridStart = new Date(monthStart);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  const gridEnd = new Date(monthEnd);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const { data: bookings = [] } = useQuery({
    queryKey: ["admin", "bookings", "calendar", monthStart.toISOString()],
    queryFn: () => fetchCalendarBookings(gridStart, gridEnd),
  });

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, { pickups: CalendarBooking[]; returns: CalendarBooking[] }>();
    for (const booking of bookings) {
      const startKey = toDateKey(new Date(booking.rentalStartDate));
      const endKey = toDateKey(new Date(booking.rentalEndDate));

      if (!map.has(startKey)) map.set(startKey, { pickups: [], returns: [] });
      map.get(startKey)!.pickups.push(booking);

      if (!map.has(endKey)) map.set(endKey, { pickups: [], returns: [] });
      map.get(endKey)!.returns.push(booking);
    }
    return map;
  }, [bookings]);

  const days: Date[] = [];
  for (let d = new Date(gridStart); d <= gridEnd; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  const todayKey = toDateKey(new Date());

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg">
          {monthCursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const now = new Date();
              setMonthCursor(new Date(now.getFullYear(), now.getMonth(), 1));
            }}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-px overflow-hidden rounded-md border border-border bg-border text-xs">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="bg-secondary/40 px-2 py-2 text-center font-medium uppercase tracking-wide text-muted-foreground"
          >
            {day}
          </div>
        ))}
        {days.map((day) => {
          const key = toDateKey(day);
          const entry = bookingsByDate.get(key);
          const isCurrentMonth = day.getMonth() === monthCursor.getMonth();
          const isToday = key === todayKey;

          return (
            <div
              key={key}
              className={cn(
                "min-h-24 bg-card p-1.5",
                !isCurrentMonth && "bg-secondary/20 text-muted-foreground"
              )}
            >
              <p
                className={cn(
                  "mb-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs",
                  isToday && "bg-primary font-medium text-primary-foreground"
                )}
              >
                {day.getDate()}
              </p>
              <div className="space-y-0.5">
                {entry?.pickups.map((booking) => (
                  <div
                    key={`pickup-${booking._id}`}
                    className="flex items-center gap-1 truncate rounded bg-emerald-100 px-1 py-0.5 text-[10px] text-emerald-800"
                    title={`Pickup: ${booking.bookingNumber} — ${booking.customer?.name ?? ""}`}
                  >
                    <LogOut className="h-2.5 w-2.5 shrink-0" />
                    <span className="truncate">{booking.customer?.name ?? booking.bookingNumber}</span>
                  </div>
                ))}
                {entry?.returns.map((booking) => (
                  <div
                    key={`return-${booking._id}`}
                    className="flex items-center gap-1 truncate rounded bg-amber-100 px-1 py-0.5 text-[10px] text-amber-800"
                    title={`Return: ${booking.bookingNumber} — ${booking.customer?.name ?? ""}`}
                  >
                    <LogIn className="h-2.5 w-2.5 shrink-0" />
                    <span className="truncate">{booking.customer?.name ?? booking.bookingNumber}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <LogOut className="h-3 w-3 text-emerald-700" /> Pickup
        </span>
        <span className="flex items-center gap-1">
          <LogIn className="h-3 w-3 text-amber-700" /> Return
        </span>
      </div>
    </div>
  );
}
