import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Booking } from "@/models/Booking";
import { bookingStatusSchema } from "@/lib/validations/booking";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { apiSuccess, apiError, apiErrorFromUnknown } from "@/lib/api/response";
import {
  notifyBookingConfirmed,
  notifyBookingReturned,
  notifyBookingCancelled,
} from "@/lib/notifications/whatsapp-events";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await connectToDatabase();

  const booking = await Booking.findById(id)
    .populate("customer", "name email phone")
    .populate("product", "name images sku")
    .lean();

  if (!booking) {
    return apiError("Booking not found", 404);
  }

  return apiSuccess({ booking });
}

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const input = bookingStatusSchema.parse(body);

    await connectToDatabase();
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: input.status },
      { returnDocument: "after" }
    )
      .populate("customer", "name phone")
      .populate("product", "name");

    if (!booking) {
      return apiError("Booking not found", 404);
    }

    const customer = booking.customer as unknown as { name: string; phone?: string } | null;
    const product = booking.product as unknown as { name: string } | null;

    const notifyContext = {
      customerName: customer?.name ?? "Customer",
      customerPhone: customer?.phone,
      relatedEntityType: "Booking" as const,
      relatedEntityId: id,
      variables: {
        bookingNumber: booking.bookingNumber,
        productName: product?.name ?? "",
        eventDate: booking.eventDate.toLocaleDateString("en-IN"),
        rentalStartDate: booking.rentalStartDate.toLocaleDateString("en-IN"),
        rentalEndDate: booking.rentalEndDate.toLocaleDateString("en-IN"),
        totalAmount: String(booking.totalAmount),
      },
    };

    if (input.status === "confirmed") {
      void notifyBookingConfirmed(notifyContext);
    } else if (input.status === "returned") {
      void notifyBookingReturned(notifyContext);
    } else if (input.status === "cancelled") {
      void notifyBookingCancelled(notifyContext);
    }

    return apiSuccess({ booking });
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
