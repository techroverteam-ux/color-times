import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/User";
import { Booking } from "@/models/Booking";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { apiSuccess, apiError } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await connectToDatabase();

  const [customer, bookings] = await Promise.all([
    User.findById(id).select("name email phone addresses createdAt").lean(),
    Booking.find({ customer: id })
      .populate("product", "name images")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  if (!customer) {
    return apiError("Customer not found", 404);
  }

  return apiSuccess({ customer, bookings });
}
