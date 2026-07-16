import { connectToDatabase } from "@/lib/db/connect";
import { Notification } from "@/models/Notification";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { apiSuccess, apiErrorFromUnknown } from "@/lib/api/response";

export async function PATCH(): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  try {
    await connectToDatabase();

    await Notification.updateMany(
      { recipient: auth.user.sub, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return apiSuccess({ updated: true });
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
