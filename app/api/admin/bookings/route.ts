import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Booking } from "@/models/Booking";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { apiSuccess } from "@/lib/api/response";

export async function GET(request: NextRequest): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  await connectToDatabase();

  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(200, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const filter: Record<string, unknown> = {};
  if (status) {
    filter.status = status;
  }
  if (from && to) {
    filter.rentalStartDate = { $lte: new Date(to) };
    filter.rentalEndDate = { $gte: new Date(from) };
  }

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate("customer", "name email")
      .populate("product", "name images")
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Booking.countDocuments(filter),
  ]);

  return apiSuccess({
    bookings,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}
