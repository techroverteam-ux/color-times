import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/User";
import { requireApiRole } from "@/lib/api/require-role";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { changePasswordSchema } from "@/lib/validations/account";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { recordAuditLog } from "@/lib/audit/log";
import { apiSuccess, apiError, apiErrorFromUnknown } from "@/lib/api/response";

export async function POST(request: NextRequest): Promise<Response> {
  const auth = await requireApiRole(ADMIN_ROLES);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const input = changePasswordSchema.parse(body);

    await connectToDatabase();

    const user = await User.findById(auth.user.sub).select("+passwordHash");
    if (!user) {
      return apiError("Account not found", 404);
    }

    const isValid = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!isValid) {
      return apiError("Current password is incorrect", 401);
    }

    user.passwordHash = await hashPassword(input.newPassword);
    await user.save();

    await recordAuditLog({
      entityType: "User",
      entityId: auth.user.sub,
      action: "update",
      actor: auth.user,
      changes: [{ field: "passwordHash", from: "(previous)", to: "(changed by self)" }],
    });

    return apiSuccess({ changed: true });
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
