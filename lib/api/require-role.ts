import "server-only";
import { getCurrentUser } from "@/lib/auth/session";
import { apiError } from "@/lib/api/response";
import type { AccessTokenPayload } from "@/lib/auth/tokens";
import type { UserRole } from "@/models/User";

export async function requireApiRole(
  allowedRoles: UserRole[]
): Promise<{ user: AccessTokenPayload } | { error: Response }> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: apiError("Authentication required", 401) };
  }

  if (!allowedRoles.includes(user.role)) {
    return { error: apiError("You do not have permission to perform this action", 403) };
  }

  return { user };
}
