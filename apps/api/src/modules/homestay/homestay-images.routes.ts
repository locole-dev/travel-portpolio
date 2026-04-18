import { Router } from "express";
import { z } from "zod";

import { sendCreated, sendSuccess } from "../../lib/http.js";
import { validateRequest } from "../../middleware/validate.js";
import {
  createHomestayImage,
  deleteHomestayImage,
  listHomestayImages,
  updateHomestayImage
} from "./homestay.service.js";

const imageSchema = z.object({
  imageUrl: z.string().trim().min(1).max(2048),
  altText: z.string().trim().min(2).max(180),
  sortOrder: z.number().int().nonnegative().default(0)
});

const imageUpdateSchema = imageSchema.partial();
const imageIdSchema = z.object({
  imageId: z.string().min(1)
});

export const homestayImagesRoutes = Router();

homestayImagesRoutes.get("/", async (_request, response) => {
  sendSuccess(response, await listHomestayImages());
});

homestayImagesRoutes.post(
  "/",
  validateRequest({ body: imageSchema }),
  async (request, response) => {
    sendCreated(response, await createHomestayImage(request.body));
  }
);

homestayImagesRoutes.patch(
  "/:imageId",
  validateRequest({ params: imageIdSchema, body: imageUpdateSchema }),
  async (request, response) => {
    const { imageId } = request.params as { imageId: string };
    sendSuccess(
      response,
      await updateHomestayImage(imageId, request.body)
    );
  }
);

homestayImagesRoutes.delete(
  "/:imageId",
  validateRequest({ params: imageIdSchema }),
  async (request, response) => {
    const { imageId } = request.params as { imageId: string };
    await deleteHomestayImage(imageId);
    sendSuccess(response, { deleted: true });
  }
);
