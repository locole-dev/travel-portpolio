import { Router } from "express";
import { z } from "zod";

import { sendSuccess } from "../../lib/http.js";
import { validateRequest } from "../../middleware/validate.js";
import { getProfile, updateProfile } from "./profile.service.js";

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  title: z.string().trim().min(2).max(120),
  shortIntro: z.string().trim().min(10).max(500),
  avatarImage: z.string().trim().min(1).optional().nullable(),
  heroPrimaryCtaLabel: z.string().trim().min(2).max(60),
  heroPrimaryCtaLink: z.string().trim().min(1).max(300),
  heroSecondaryCtaLabel: z.string().trim().min(2).max(60),
  heroSecondaryCtaLink: z.string().trim().min(1).max(300)
});

export const profileRoutes = Router();

profileRoutes.get("/", async (_request, response) => {
  const profile = await getProfile();
  sendSuccess(response, profile);
});

profileRoutes.put(
  "/",
  validateRequest({ body: profileSchema }),
  async (request, response) => {
    const profile = await updateProfile(request.body);
    sendSuccess(response, profile);
  }
);
