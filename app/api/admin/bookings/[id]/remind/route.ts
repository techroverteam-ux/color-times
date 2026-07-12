import { connectToDatabase } from "@/lib/db/connect";
import { Booking } from "@/models/Booking";
import "@/models/User";
import "@/models/Product";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { apiSuccess, apiError, apiErrorFromUnknown } from "@/lib/api/response";
import { notifyBookingReminder } from "@/lib/notifications/whatsapp-events";
import { formatDate } from "@/lib/utils";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    await connectToDatabase();

    const booking = await Booking.findById(id)
      .populate("customer", "name phone")
      .populate("items.product", "name");

    if (!booking) {
      return apiError("Booking not found", 404);
    }

    const customer = booking.customer as unknown as { name: string; phone?: string } | null;
    const productNames = booking.items
      .map((item) => (item.product as unknown as { name: string } | null)?.name)
      .filter(Boolean)
      .join(", ");

    await notifyBookingReminder({
      customerName: customer?.name ?? "Customer",
      customerPhone: customer?.phone,
      relatedEntityType: "Booking",
      relatedEntityId: id,
      variables: {
        bookingNumber: booking.bookingNumber,
        productName: productNames,
        eventDate: formatDate(booking.eventDate),
        rentalStartDate: formatDate(booking.rentalStartDate),
      },
    });

    return apiSuccess({ sent: true });
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
