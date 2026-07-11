import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Invoice } from "@/models/Invoice";
import { Booking } from "@/models/Booking";
import { generateInvoiceNumber } from "@/lib/admin/invoice-number";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { recordAuditLog } from "@/lib/audit/log";
import { formatDate } from "@/lib/utils";
import { apiSuccess, apiError, apiErrorFromUnknown } from "@/lib/api/response";

export async function POST(request: NextRequest): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const bookingId = String(body.bookingId ?? "");
    if (!bookingId) {
      return apiError("bookingId is required", 400);
    }

    await connectToDatabase();

    const booking = await Booking.findById(bookingId).populate("product", "name").lean();
    if (!booking) {
      return apiError("Booking not found", 404);
    }

    const existing = await Invoice.findOne({
      booking: bookingId,
      deletedAt: null,
      status: { $ne: "cancelled" },
    }).lean();
    if (existing) {
      return apiError("This booking already has an active invoice", 409);
    }

    const productName = (booking.product as unknown as { name: string } | null)?.name ?? "Rental";
    const rentalFee = booking.rentalFee;
    const total = booking.rentalFee + booking.securityDeposit;
    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
      invoiceNumber,
      customer: booking.customer,
      booking: booking._id,
      lineItems: [
        {
          description: `Rental — ${productName} (${booking.size}), ${formatDate(booking.rentalStartDate)} to ${formatDate(booking.rentalEndDate)}`,
          quantity: 1,
          unitPrice: rentalFee,
          amount: rentalFee,
        },
      ],
      subtotal: rentalFee,
      discountAmount: 0,
      taxRate: 0,
      taxAmount: 0,
      securityDeposit: booking.securityDeposit,
      total,
      amountPaid: 0,
      amountDue: total,
      status: "draft",
      dueDate: booking.eventDate,
      notes: `Auto-generated from booking ${booking.bookingNumber}`,
    });

    await recordAuditLog({
      entityType: "Invoice",
      entityId: String(invoice._id),
      action: "create",
      actor: auth.user,
      snapshot: invoice.toObject() as unknown as Record<string, unknown>,
      metadata: { fromBooking: booking.bookingNumber },
    });

    return apiSuccess({ invoice }, 201);
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
