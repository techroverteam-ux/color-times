import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { UserRole } from "@/models/User";

export interface AccessTokenPayload extends JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface RefreshTokenPayload extends JWTPayload {
  sub: string;
  tokenVersion: string;
}

function getSecret(name: "access" | "refresh"): Uint8Array {
  const key = name === "access" ? process.env.JWT_ACCESS_SECRET : process.env.JWT_REFRESH_SECRET;
  if (!key) {
    throw new Error(`JWT_${name.toUpperCase()}_SECRET is not set`);
  }
  return new TextEncoder().encode(key);
}

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN ?? "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? "30d";

export async function signAccessToken(
  payload: Omit<AccessTokenPayload, "iat" | "exp">
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRES_IN)
    .sign(getSecret("access"));
}

export async function signRefreshToken(
  payload: Omit<RefreshTokenPayload, "iat" | "exp">
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRES_IN)
    .sign(getSecret("refresh"));
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, getSecret("access"));
  return payload as AccessTokenPayload;
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  const { payload } = await jwtVerify(token, getSecret("refresh"));
  return payload as RefreshTokenPayload;
}
