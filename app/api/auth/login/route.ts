import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/User";
import { verifyPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/tokens";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "@/lib/auth/cookies";
import { loginSchema } from "@/lib/validations/auth";
import { apiSuccess, apiError, apiErrorFromUnknown } from "@/lib/api/response";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const input = loginSchema.parse(body);

    await connectToDatabase();

    const user = await User.findOne({ email: input.email }).select("+passwordHash");
    if (!user) {
      return apiError("Invalid email or password", 401);
    }

    const isValid = await verifyPassword(input.password, user.passwordHash);
    if (!isValid) {
      return apiError("Invalid email or password", 401);
    }

    const accessToken = await signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });
    const refreshToken = await signRefreshToken({
      sub: user._id.toString(),
      tokenVersion: user._id.toString(),
    });

    const response = apiSuccess({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });
    response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, accessTokenCookieOptions);
    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookieOptions);
    return response;
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
