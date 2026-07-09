import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/db/connect";
import { Booking } from "@/models/Booking";
import { BookingsClient } from "@/components/admin/bookings-client";

export const metadata: Metadata = { title: "Bookings" };

const PAGE_SIZE = 20;

export default async function AdminBookingsPage() {
  await connectToDatabase();

  const [bookings, total] = await Promise.all([
    Booking.find()
      .populate("customer", "name email")
      .populate("product", "name images")
      .sort({ createdAt: -1 })
      .limit(PAGE_SIZE)
      .lean(),
    Booking.countDocuments(),
  ]);

  const initialBookings = bookings.map((booking) => ({
    _id: String(booking._id),
    bookingNumber: booking.bookingNumber,
    status: booking.status,
    rentalStartDate: booking.rentalStartDate.toISOString(),
    rentalEndDate: booking.rentalEndDate.toISOString(),
    totalAmount: booking.totalAmount,
    customer: booking.customer
      ? {
          name: (booking.customer as unknown as { name: string }).name,
          email: (booking.customer as unknown as { email: string }).email,
        }
      : null,
    product: booking.product
      ? { name: (booking.product as unknown as { name: string }).name }
      : null,
  }));

  return (
    <BookingsClient
      initialBookings={initialBookings}
      initialPagination={{
        page: 1,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / PAGE_SIZE),
      }}
    />
  );
}
