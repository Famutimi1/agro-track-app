import { Request, Response } from "express";
import { env } from "../config/env";

export const ACCESS_COOKIE = "agrotrack_access";
export const REFRESH_COOKIE = "agrotrack_refresh";

export function readCookie(header: string | undefined, name: string): string | undefined {
  const value = header?.split(";").map(part => part.trim()).find(part => part.startsWith(`${name}=`));
  if (!value) return undefined;
  try { return decodeURIComponent(value.slice(name.length + 1)); } catch { return undefined; }
}

export function setSessionCookies(res: Response, accessToken: string, refreshToken: string) {
  const options = { httpOnly: true, secure: env.NODE_ENV === "production", sameSite: "strict" as const };
  res.cookie(ACCESS_COOKIE, accessToken, { ...options, path: "/", maxAge: 15 * 60 * 1000 });
  res.cookie(REFRESH_COOKIE, refreshToken, { ...options, path: "/api/auth", maxAge: 7 * 24 * 60 * 60 * 1000 });
}

export function clearSessionCookies(res: Response) {
  const options = { httpOnly: true, secure: env.NODE_ENV === "production", sameSite: "strict" as const };
  res.clearCookie(ACCESS_COOKIE, { ...options, path: "/" });
  res.clearCookie(REFRESH_COOKIE, { ...options, path: "/api/auth" });
}

export function refreshTokenFromRequest(req: Request) {
  return readCookie(req.headers.cookie, REFRESH_COOKIE);
}
