import jwt, { type SignOptions } from "jsonwebtoken";

import { env } from "../config/env.js";

export type AdminRoleValue = "ADMIN" | "SUPER_ADMIN";

export type AuthTokenPayload = {
  sub: string;
  email: string;
  role: AdminRoleValue;
};

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  });
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.COOKIE_SECURE,
    maxAge: 1000 * 60 * 60 * 12,
    path: "/"
  };
}
