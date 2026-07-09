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
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));
  const status = searchParams.get("status");

  const filter: Record<string, unknown> = {};
  if (status) {
    filter.status = status;
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
