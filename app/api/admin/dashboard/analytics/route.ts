import { NextRequest } from "next/server";
import { getDashboardAnalytics } from "@/lib/admin/dashboard-stats";
import { resolveDateRange, type DateRangePreset } from "@/lib/admin/date-ranges";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { apiSuccess, apiErrorFromUnknown } from "@/lib/api/response";

export async function GET(request: NextRequest): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  try {
    const searchParams = request.nextUrl.searchParams;
    const preset = (searchParams.get("preset") as DateRangePreset) ?? "all";
    const customFrom = searchParams.get("from");
    const customTo = searchParams.get("to");

    const range = resolveDateRange(preset, customFrom, customTo);
    const analytics = await getDashboardAnalytics({ from: range.from, to: range.to });

    return apiSuccess({ analytics, rangeLabel: range.label });
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
