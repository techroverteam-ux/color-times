import "server-only";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "./cookies";
import { verifyAccessToken, type AccessTokenPayload } from "./tokens";

export async function getCurrentUser(): Promise<AccessTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifyAccessToken(token);
  } catch {
    return null;
  }
}

export async function requireRole(
  allowedRoles: AccessTokenPayload["role"][]
): Promise<AccessTokenPayload | null> {
  const user = await getCurrentUser();
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }
  return user;
}
