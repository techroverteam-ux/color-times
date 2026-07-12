import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { findBookingConflicts } from "@/lib/admin/booking-availability";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { apiSuccess, apiError, apiErrorFromUnknown } from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const excludeBooking = searchParams.get("excludeBooking") ?? undefined;

    if (!from || !to) {
      return apiError("from and to date parameters are required", 400);
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      return apiError("from and to must be valid dates", 400);
    }

    await connectToDatabase();

    const conflicts = await findBookingConflicts(id, fromDate, toDate, excludeBooking);

    return apiSuccess({
      available: conflicts.length === 0,
      conflicts,
    });
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
