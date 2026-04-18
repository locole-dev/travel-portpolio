import { Router } from "express";
import { z } from "zod";

import { sendSuccess } from "../../lib/http.js";
import { validateRequest } from "../../middleware/validate.js";
import { getProfile, updateProfile } from "./profile.service.js";

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  fullNameVi: z.string().trim().max(120).optional().default(""),
  title: z.string().trim().min(2).max(120),
  titleVi: z.string().trim().max(120).optional().default(""),
  shortIntro: z.string().trim().min(10).max(500),
  shortIntroVi: z.string().trim().max(500).optional().default(""),
  avatarImage: z.string().trim().min(1).optional().nullable(),
  heroPrimaryCtaLabel: z.string().trim().min(2).max(60),
  heroPrimaryCtaLabelVi: z.string().trim().max(60).optional().default(""),
  heroPrimaryCtaLink: z.string().trim().min(1).max(300),
  heroSecondaryCtaLabel: z.string().trim().min(2).max(60),
  heroSecondaryCtaLabelVi: z.string().trim().max(60).optional().default(""),
  heroSecondaryCtaLink: z.string().trim().min(1).max(300),
  heroPrimaryContactId: z.union([z.string().trim().min(1).max(80), z.null()]),
  heroSecondaryContactId: z.union([z.string().trim().min(1).max(80), z.null()])
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
