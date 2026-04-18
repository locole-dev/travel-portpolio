import { Router } from "express";
import { z } from "zod";

import { sendSuccess } from "../../lib/http.js";
import { validateRequest } from "../../middleware/validate.js";
import { getClosingSection, updateClosingSection } from "./closing.service.js";

const closingSchema = z.object({
  title: z.string().trim().min(2).max(120),
  titleVi: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(10).max(500),
  messageVi: z.string().trim().max(500).optional().default(""),
  ctaLabel: z.string().trim().min(2).max(60),
  ctaLabelVi: z.string().trim().max(60).optional().default(""),
  ctaLink: z.string().trim().min(1).max(300)
});

export const closingRoutes = Router();

closingRoutes.get("/", async (_request, response) => {
  sendSuccess(response, await getClosingSection());
});

closingRoutes.put(
  "/",
  validateRequest({ body: closingSchema }),
  async (request, response) => {
    sendSuccess(response, await updateClosingSection(request.body));
  }
);
