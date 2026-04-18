import { Router } from "express";
import { z } from "zod";

import { AppError } from "../../lib/errors.js";
import { sendCreated, sendSuccess } from "../../lib/http.js";
import { uploadHomestayVideo } from "../../lib/upload.js";
import { validateRequest } from "../../middleware/validate.js";
import {
  createHomestayImage,
  deleteHomestayImage,
  listHomestayImages,
  nextHomestayGallerySortOrder,
  updateHomestayImage
} from "./homestay.service.js";

const mediaKindSchema = z.enum(["IMAGE", "VIDEO"]).optional().default("IMAGE");

const imageSchema = z.object({
  imageUrl: z.string().trim().min(1).max(2048),
  mediaKind: mediaKindSchema,
  altText: z.string().trim().min(2).max(180),
  altTextVi: z.string().trim().max(180).optional().default(""),
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
  "/upload-video",
  uploadHomestayVideo.single("file"),
  async (request, response) => {
    if (!request.file) {
      throw new AppError(422, "FILE_REQUIRED", "A video file is required.");
    }
    const publicUrl = `/uploads/${request.file.filename}`;
    const rawAlt =
      typeof request.body?.altText === "string" ? request.body.altText.trim() : "";
    const altText =
      rawAlt.length >= 2 ? rawAlt.slice(0, 180) : "Homestay video";
    let sortOrder: number;
    const rawOrder = request.body?.sortOrder;
    if (rawOrder !== undefined && rawOrder !== "") {
      const n = Number(rawOrder);
      sortOrder = Number.isInteger(n) && n >= 0 ? n : await nextHomestayGallerySortOrder();
    } else {
      sortOrder = await nextHomestayGallerySortOrder();
    }
    sendCreated(
      response,
      await createHomestayImage({
        imageUrl: publicUrl,
        mediaKind: "VIDEO",
        altText,
        sortOrder
      })
    );
  }
);

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
