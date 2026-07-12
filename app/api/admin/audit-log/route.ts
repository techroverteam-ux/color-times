import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { AuditLog } from "@/models/AuditLog";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { apiSuccess, apiError, apiErrorFromUnknown } from "@/lib/api/response";

export async function GET(request: NextRequest): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  const entityType = request.nextUrl.searchParams.get("entityType");
  const entityId = request.nextUrl.searchParams.get("entityId");

  if (!entityType || !entityId) {
    return apiError("entityType and entityId are required", 400);
  }

  try {
    await connectToDatabase();
    const entries = await AuditLog.find({ entityType, entityId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return apiSuccess({ entries });
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
