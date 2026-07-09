import { getCurrentUser } from "@/lib/auth/session";
import { apiSuccess } from "@/lib/api/response";

export async function GET(): Promise<Response> {
  const user = await getCurrentUser();
  return apiSuccess({ user });
}
