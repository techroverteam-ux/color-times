import "server-only";
import { Booking } from "@/models/Booking";
import type { BookingStatus } from "@/models/Booking";

export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ["pending_payment", "confirmed", "in_use"];

export interface BookingConflict {
  _id: string;
  bookingNumber: string;
  rentalStartDate: Date;
  rentalEndDate: Date;
  status: BookingStatus;
}

export async function findBookingConflicts(
  productId: string,
  rentalStartDate: Date,
  rentalEndDate: Date,
  excludeBookingId?: string
): Promise<BookingConflict[]> {
  const filter: Record<string, unknown> = {
    product: productId,
    status: { $in: ACTIVE_BOOKING_STATUSES },
    rentalStartDate: { $lte: rentalEndDate },
    rentalEndDate: { $gte: rentalStartDate },
  };
  if (excludeBookingId) {
    filter._id = { $ne: excludeBookingId };
  }

  const conflicts = await Booking.find(filter)
    .select("bookingNumber rentalStartDate rentalEndDate status")
    .lean();

  return conflicts.map((booking) => ({
    _id: String(booking._id),
    bookingNumber: booking.bookingNumber,
    rentalStartDate: booking.rentalStartDate,
    rentalEndDate: booking.rentalEndDate,
    status: booking.status,
  }));
}
