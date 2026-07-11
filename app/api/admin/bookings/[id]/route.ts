import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Booking } from "@/models/Booking";
import { Product } from "@/models/Product";
import "@/models/User";
import { bookingStatusSchema } from "@/lib/validations/booking";
import { ACTIVE_BOOKING_STATUSES } from "@/lib/admin/booking-availability";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { recordAuditLog } from "@/lib/audit/log";
import { apiSuccess, apiError, apiErrorFromUnknown } from "@/lib/api/response";
import {
  notifyBookingConfirmed,
  notifyBookingReturned,
  notifyBookingCancelled,
} from "@/lib/notifications/whatsapp-events";
import { formatDate } from "@/lib/utils";

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

    const before = await Booking.findById(id).lean();
    if (!before) {
      return apiError("Booking not found", 404);
    }

    const update: Record<string, unknown> = { status: input.status };
    if (input.status === "returned") {
      update.returnedAt = new Date();
      if (input.returnCondition) update.returnCondition = input.returnCondition;
      if (input.returnNotes) update.returnNotes = input.returnNotes;
    }

    const booking = await Booking.findByIdAndUpdate(id, update, { returnDocument: "after" })
      .populate("customer", "name phone")
      .populate("product", "name");

    if (!booking) {
      return apiError("Booking not found", 404);
    }

    if (input.status !== before.status) {
      await recordAuditLog({
        entityType: "Booking",
        entityId: id,
        action: "status_change",
        actor: auth.user,
        changes: [{ field: "status", from: before.status, to: input.status }],
      });
    }

    // Keep the dress's inventory status in sync with the booking lifecycle.
    if (input.status === "confirmed" || input.status === "in_use") {
      await Product.findByIdAndUpdate(booking.product, { status: "booked" });
    } else if (input.status === "returned") {
      await Product.findByIdAndUpdate(booking.product, { status: "returned" });
    } else if (input.status === "cancelled") {
      const stillActive = await Booking.exists({
        product: booking.product,
        status: { $in: ACTIVE_BOOKING_STATUSES },
        _id: { $ne: booking._id },
      });
      if (!stillActive) {
        await Product.findByIdAndUpdate(booking.product, { status: "available" });
      }
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
        eventDate: formatDate(booking.eventDate),
        rentalStartDate: formatDate(booking.rentalStartDate),
        rentalEndDate: formatDate(booking.rentalEndDate),
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
