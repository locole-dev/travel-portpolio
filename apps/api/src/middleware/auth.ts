import type { NextFunction, Request, Response } from "express";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { verifyAuthToken } from "../lib/jwt.js";
import { env } from "../config/env.js";

export async function requireAuth(
  request: Request,
  _response: Response,
  next: NextFunction
) {
  const token = request.cookies?.[env.COOKIE_NAME] as string | undefined;

  if (!token) {
    next(new AppError(401, "UNAUTHENTICATED", "Authentication is required."));
    return;
  }

  try {
    const payload = verifyAuthToken(token);
    const admin = await prisma.adminUser.findUnique({
      where: {
        id: payload.sub
      }
    });

    if (!admin) {
      next(new AppError(401, "UNAUTHENTICATED", "Authentication is required."));
      return;
    }

    request.user = {
      id: admin.id,
      email: admin.email,
      role: admin.role
    };

    next();
  } catch {
    next(new AppError(401, "INVALID_TOKEN", "Your session has expired."));
  }
}
