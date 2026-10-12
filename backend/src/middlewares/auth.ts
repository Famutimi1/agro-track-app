import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../utils/api-error";
import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ACCESS_COOKIE, readCookie } from "../utils/session-cookies";

export interface AuthenticatedUser { sub: string; email: string; role: Role; lenderId?: string; sid: string }
declare global { namespace Express { interface Request { user?: AuthenticatedUser } } }

export async function verifyAccessSession(token: string): Promise<AuthenticatedUser> {
  let payload: jwt.JwtPayload;
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
    if (typeof decoded === "string" || typeof decoded.sub !== "string" || typeof decoded.sid !== "string") throw new Error("Invalid claims");
    payload = decoded;
  } catch { throw ApiError.unauthorized("Invalid or expired token"); }
  const session = await prisma.refreshToken.findFirst({
    where: { id: payload.sid, userId: payload.sub, expiresAt: { gt: new Date() }, user: { isActive: true } },
    include: { user: { select: { id: true, email: true, role: true, lenderOrgId: true } } },
  });
  if (!session) throw ApiError.unauthorized("Session expired or revoked");
  return { sub: session.user.id, email: session.user.email, role: session.user.role, lenderId: session.user.lenderOrgId || undefined, sid: session.id };
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : readCookie(req.headers.cookie, ACCESS_COOKIE);
  if (!token) { next(ApiError.unauthorized("Authentication required")); return; }
  verifyAccessSession(token).then(user => { req.user = user; next(); }).catch(next);
}

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw ApiError.unauthorized();
    if (!roles.includes(req.user.role)) throw ApiError.forbidden("You do not have permission to perform this action");
    if (req.user.role.startsWith("LENDER_") && !req.user.lenderId) throw ApiError.forbidden("Lender organization required");
    next();
  };
}
