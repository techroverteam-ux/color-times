import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/User";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { updateAccountSchema } from "@/lib/validations/account";
import { recordAuditLog, diffObjects } from "@/lib/audit/log";
import { apiSuccess, apiError, apiErrorFromUnknown } from "@/lib/api/response";

export async function PATCH(request: NextRequest): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const input = updateAccountSchema.parse(body);

    await connectToDatabase();

    const before = await User.findById(auth.user.sub).select("name phone");
    if (!before) {
      return apiError("Account not found", 404);
    }
    const beforeSnapshot = before.toObject() as unknown as Record<string, unknown>;

    before.name = input.name;
    before.phone = input.phone || undefined;
    await before.save();

    const changes = diffObjects(
      beforeSnapshot,
      before.toObject() as unknown as Record<string, unknown>
    );
    if (changes.length > 0) {
      await recordAuditLog({
        entityType: "User",
        entityId: auth.user.sub,
        action: "update",
        actor: auth.user,
        changes,
      });
    }

    return apiSuccess({ name: before.name, phone: before.phone ?? "" });
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
