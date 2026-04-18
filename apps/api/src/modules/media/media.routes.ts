import { Router } from "express";
import { z } from "zod";

import { AppError } from "../../lib/errors.js";
import { sendCreated, sendSuccess } from "../../lib/http.js";
import { upload } from "../../lib/upload.js";
import { validateRequest } from "../../middleware/validate.js";
import {
  createMediaAssetFromUpload,
  deleteMediaAsset,
  listMediaAssets,
  updateMediaAsset
} from "./media.service.js";

const mediaIdSchema = z.object({
  mediaId: z.string().min(1)
});

const mediaUpdateSchema = z.object({
  altText: z.string().trim().max(180).optional().nullable()
});

export const mediaRoutes = Router();

mediaRoutes.get("/", async (_request, response) => {
  sendSuccess(response, await listMediaAssets());
});

mediaRoutes.post("/", upload.single("file"), async (request, response) => {
  if (!request.file || !request.user) {
    throw new AppError(422, "FILE_REQUIRED", "An image file is required.");
  }

  sendCreated(
    response,
    await createMediaAssetFromUpload(request.file, request.user.id)
  );
});

mediaRoutes.patch(
  "/:mediaId",
  validateRequest({ params: mediaIdSchema, body: mediaUpdateSchema }),
  async (request, response) => {
    const { mediaId } = request.params as { mediaId: string };
    sendSuccess(
      response,
      await updateMediaAsset(mediaId, request.body)
    );
  }
);

mediaRoutes.delete(
  "/:mediaId",
  validateRequest({ params: mediaIdSchema }),
  async (request, response) => {
    const { mediaId } = request.params as { mediaId: string };
    await deleteMediaAsset(mediaId);
    sendSuccess(response, { deleted: true });
  }
);
