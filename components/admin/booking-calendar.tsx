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

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_VISIBLE_CHIPS = 3;

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

function DayChip({
  type,
  booking,
}: {
  type: "pickup" | "return";
  booking: CalendarBooking;
}) {
  const isPickup = type === "pickup";
  return (
    <div
      className={cn(
        "flex items-center gap-1 truncate rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
        isPickup
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
          : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
      )}
      title={`${isPickup ? "Pickup" : "Return"}: ${booking.bookingNumber} — ${booking.customer?.name ?? ""}`}
    >
      {isPickup ? (
        <LogOut className="h-2.5 w-2.5 shrink-0" />
      ) : (
        <LogIn className="h-2.5 w-2.5 shrink-0" />
      )}
      <span className="truncate">{booking.customer?.name ?? booking.bookingNumber}</span>
    </div>
  );
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
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-heading text-xl">
          {monthCursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex items-center gap-1 rounded-full border border-border bg-secondary/40 p-1">
          <button
            type="button"
            onClick={() =>
              setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
            }
            className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 rounded-full px-3 text-xs"
            onClick={() => {
              const now = new Date();
              setMonthCursor(new Date(now.getFullYear(), now.getMonth(), 1));
            }}
          >
            Today
          </Button>
          <button
            type="button"
            onClick={() =>
              setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
            }
            className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border bg-secondary/20">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={cn(
              "px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
              (index === 0 || index === 6) && "text-accent/80"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const key = toDateKey(day);
          const entry = bookingsByDate.get(key);
          const isCurrentMonth = day.getMonth() === monthCursor.getMonth();
          const isToday = key === todayKey;
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          const allChips = [
            ...(entry?.pickups.map((b) => ({ type: "pickup" as const, booking: b })) ?? []),
            ...(entry?.returns.map((b) => ({ type: "return" as const, booking: b })) ?? []),
          ];
          const visibleChips = allChips.slice(0, MAX_VISIBLE_CHIPS);
          const overflowCount = allChips.length - visibleChips.length;

          return (
            <div
              key={key}
              className={cn(
                "min-h-28 border-b border-r border-border/70 p-2 transition-colors hover:bg-secondary/20",
                index % 7 === 6 && "border-r-0",
                !isCurrentMonth && "bg-secondary/10",
                isWeekend && isCurrentMonth && "bg-secondary/5"
              )}
            >
              <p
                className={cn(
                  "mb-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                  isToday
                    ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                    : isCurrentMonth
                      ? "text-foreground"
                      : "text-muted-foreground/50"
                )}
              >
                {day.getDate()}
              </p>
              <div className="space-y-1">
                {visibleChips.map(({ type, booking }) => (
                  <DayChip key={`${type}-${booking._id}`} type={type} booking={booking} />
                ))}
                {overflowCount > 0 && (
                  <p className="px-1.5 text-[10px] font-medium text-muted-foreground">
                    +{overflowCount} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-5 border-t border-border px-5 py-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Pickup
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> Return
        </span>
      </div>
    </div>
  );
}
