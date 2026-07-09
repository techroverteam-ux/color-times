import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Booking } from "@/models/Booking";
import { User } from "@/models/User";
import { trackingSchema } from "@/lib/validations/tracking";
import { apiSuccess, apiError, apiErrorFromUnknown } from "@/lib/api/response";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const input = trackingSchema.parse(body);

    await connectToDatabase();

    const customer = await User.findOne({ email: input.email }).select("_id").lean();
    if (!customer) {
      return apiError("We couldn't find a booking with that number and email.", 404);
    }

    const booking = await Booking.findOne({
      bookingNumber: input.bookingNumber.toUpperCase(),
      customer: customer._id,
    }).lean();

    if (!booking) {
      return apiError("We couldn't find a booking with that number and email.", 404);
    }

    return apiSuccess({
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      rentalStartDate: booking.rentalStartDate,
      rentalEndDate: booking.rentalEndDate,
      eventDate: booking.eventDate,
    });
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
