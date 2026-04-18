import { Router } from "express";
import { z } from "zod";

import { sendSuccess } from "../../lib/http.js";
import { validateRequest } from "../../middleware/validate.js";
import { getHomestayContent, updateHomestaySection } from "./homestay.service.js";

const homestaySchema = z
  .object({
    title: z.string().trim().min(2).max(120),
    previewDescription: z.string().trim().min(10).max(500),
    description: z.string().trim().min(10).max(10000),
    isActive: z.boolean().default(true),
    latitude: z.union([z.number().min(-90).max(90), z.null()]),
    longitude: z.union([z.number().min(-180).max(180), z.null()]),
    locationLabel: z.union([z.string().trim().max(200), z.null()]),
    seasonalRatesNote: z.union([z.string().trim().max(10000), z.null()])
  })
  .refine(
    (body) =>
      (body.latitude === null && body.longitude === null) ||
      (body.latitude !== null && body.longitude !== null),
    { message: "Latitude and longitude must both be set or both empty.", path: ["latitude"] }
  );

export const homestayRoutes = Router();

homestayRoutes.get("/", async (_request, response) => {
  sendSuccess(response, await getHomestayContent());
});

homestayRoutes.put(
  "/",
  validateRequest({ body: homestaySchema }),
  async (request, response) => {
    sendSuccess(response, await updateHomestaySection(request.body));
  }
);
