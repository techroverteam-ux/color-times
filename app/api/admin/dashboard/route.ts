import { getDashboardStats } from "@/lib/admin/dashboard-stats";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { apiSuccess, apiErrorFromUnknown } from "@/lib/api/response";

export async function GET(): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  try {
    const stats = await getDashboardStats();
    return apiSuccess(stats);
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
