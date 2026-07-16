import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Notification } from "@/models/Notification";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { apiSuccess, apiErrorFromUnknown } from "@/lib/api/response";

export async function GET(request: NextRequest): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "20")));

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipient: auth.user.sub })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipient: auth.user.sub, isRead: false }),
    ]);

    return apiSuccess({ notifications, unreadCount });
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
