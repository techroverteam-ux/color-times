import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/cookies";
import { apiSuccess } from "@/lib/api/response";

export async function POST(): Promise<Response> {
  const response = apiSuccess({ loggedOut: true });
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}
