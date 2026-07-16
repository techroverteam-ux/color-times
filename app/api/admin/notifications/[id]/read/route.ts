import { connectToDatabase } from "@/lib/db/connect";
import { Notification } from "@/models/Notification";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { apiSuccess, apiError, apiErrorFromUnknown } from "@/lib/api/response";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    await connectToDatabase();

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: auth.user.sub },
      { isRead: true, readAt: new Date() },
      { returnDocument: "after" }
    );

    if (!notification) {
      return apiError("Notification not found", 404);
    }

    return apiSuccess({ notification });
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
