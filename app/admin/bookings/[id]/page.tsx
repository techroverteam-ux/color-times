import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { connectToDatabase } from "@/lib/db/connect";
import { Booking } from "@/models/Booking";
import "@/models/User";
import "@/models/Product";
import { BookingDetailClient } from "@/components/admin/booking-detail-client";

export const metadata: Metadata = { title: "Booking Detail" };

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectToDatabase();

  const booking = await Booking.findById(id)
    .populate("customer", "name email phone")
    .populate("product", "name images sku")
    .lean();

  if (!booking) {
    notFound();
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/admin/bookings"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Bookings
      </Link>

      <BookingDetailClient
        initialBooking={{
          _id: String(booking._id),
          bookingNumber: booking.bookingNumber,
          status: booking.status,
          customer: booking.customer
            ? {
                name: (booking.customer as unknown as { name: string }).name,
                email: (booking.customer as unknown as { email: string }).email,
                phone: (booking.customer as unknown as { phone?: string }).phone,
              }
            : null,
          product: booking.product
            ? {
                name: (booking.product as unknown as { name: string }).name,
                images: (booking.product as unknown as { images: string[] }).images,
                sku: (booking.product as unknown as { sku: string }).sku,
              }
            : null,
          size: booking.size,
          rentalStartDate: booking.rentalStartDate.toISOString(),
          rentalEndDate: booking.rentalEndDate.toISOString(),
          eventDate: booking.eventDate.toISOString(),
          rentalFee: booking.rentalFee,
          securityDeposit: booking.securityDeposit,
          totalAmount: booking.totalAmount,
          deliveryAddress: booking.deliveryAddress,
          notes: booking.notes,
          returnCondition: booking.returnCondition,
          returnNotes: booking.returnNotes,
          returnedAt: booking.returnedAt ? booking.returnedAt.toISOString() : null,
          createdAt: booking.createdAt.toISOString(),
        }}
      />
    </div>
  );
}
