import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../../middleware/auth.js";
import { validateRequest } from "../../middleware/validate.js";
import { sendSuccess } from "../../lib/http.js";
import { env } from "../../config/env.js";
import { getAuthCookieOptions } from "../../lib/jwt.js";
import { authenticateAdmin } from "./auth.service.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const authRoutes = Router();

authRoutes.post(
  "/login",
  validateRequest({ body: loginSchema }),
  async (request, response) => {
    const { admin, token } = await authenticateAdmin(
      request.body.email,
      request.body.password
    );

    response.cookie(env.COOKIE_NAME, token, getAuthCookieOptions());

    sendSuccess(response, {
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role
      }
    });
  }
);

authRoutes.post("/logout", (_request, response) => {
  response.clearCookie(env.COOKIE_NAME, {
    ...getAuthCookieOptions(),
    maxAge: 0
  });

  sendSuccess(response, {
    loggedOut: true
  });
});

authRoutes.get("/me", requireAuth, async (request, response) => {
  sendSuccess(response, {
    user: request.user
  });
});
