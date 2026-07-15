import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Booking } from "@/models/Booking";
import { ServiceOrder } from "@/models/ServiceOrder";
import "@/models/User";
import { ACTIVE_BOOKING_STATUSES } from "@/lib/admin/booking-availability";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { apiSuccess } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await connectToDatabase();

  const [bookings, serviceOrders] = await Promise.all([
    Booking.find({ "items.product": id })
      .populate("customer", "name")
      .select("bookingNumber customer status rentalStartDate rentalEndDate totalAmount createdAt")
      .sort({ rentalStartDate: -1 })
      .limit(50)
      .lean(),
    ServiceOrder.find({ product: id, deletedAt: null })
      .select("serviceType status sentDate expectedReturnDate completedDate totalAmount createdAt")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
  ]);

  const mappedBookings = bookings.map((b) => ({
    _id: String(b._id),
    bookingNumber: b.bookingNumber,
    customerName: (b.customer as unknown as { name: string } | null)?.name ?? "—",
    status: b.status,
    rentalStartDate: b.rentalStartDate.toISOString(),
    rentalEndDate: b.rentalEndDate.toISOString(),
    totalAmount: b.totalAmount,
  }));

  const activeRanges = mappedBookings
    .filter((b) => ACTIVE_BOOKING_STATUSES.includes(b.status))
    .map((b) => ({
      bookingNumber: b.bookingNumber,
      rentalStartDate: b.rentalStartDate,
      rentalEndDate: b.rentalEndDate,
    }));

  const mappedServiceOrders = serviceOrders.map((s) => ({
    _id: String(s._id),
    serviceType: s.serviceType,
    status: s.status,
    sentDate: s.sentDate.toISOString(),
    expectedReturnDate: s.expectedReturnDate.toISOString(),
    completedDate: s.completedDate ? s.completedDate.toISOString() : null,
    totalAmount: s.totalAmount,
  }));

  return apiSuccess({
    bookings: mappedBookings,
    serviceOrders: mappedServiceOrders,
    activeRanges,
    summary: {
      totalBookings: mappedBookings.length,
      totalServiceOrders: mappedServiceOrders.length,
    },
  });
}
