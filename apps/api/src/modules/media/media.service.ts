import fs from "node:fs/promises";
import path from "node:path";

import type { Express } from "express";

import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";

export async function listMediaAssets() {
  return prisma.mediaAsset.findMany({
    orderBy: [{ createdAt: "desc" }]
  });
}

export async function createMediaAssetFromUpload(file: Express.Multer.File, userId: string) {
  const publicUrl = `/uploads/${file.filename}`;

  return prisma.mediaAsset.create({
    data: {
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      storagePath: path.posix.join("uploads", file.filename),
      publicUrl,
      altText: file.originalname.replace(path.extname(file.originalname), ""),
      uploadedById: userId
    }
  });
}

export async function updateMediaAsset(
  id: string,
  input: {
    altText?: string | null;
  }
) {
  const existing = await prisma.mediaAsset.findUnique({
    where: { id }
  });

  if (!existing) {
    throw new AppError(404, "MEDIA_NOT_FOUND", "Media item not found.");
  }

  return prisma.mediaAsset.update({
    where: { id },
    data: input
  });
}

export async function deleteMediaAsset(id: string) {
  const asset = await prisma.mediaAsset.findUnique({
    where: { id }
  });

  if (!asset) {
    throw new AppError(404, "MEDIA_NOT_FOUND", "Media item not found.");
  }

  const [profileRef, homestayRef] = await Promise.all([
    prisma.profile.findFirst({
      where: {
        avatarImage: asset.publicUrl
      }
    }),
    prisma.homestayImage.findFirst({
      where: {
        imageUrl: asset.publicUrl
      }
    })
  ]);

  if (profileRef || homestayRef) {
    throw new AppError(
      409,
      "MEDIA_IN_USE",
      "This media item is currently assigned to public content."
    );
  }

  await prisma.mediaAsset.delete({
    where: { id }
  });

  await fs
    .unlink(path.resolve(env.packageRoot, asset.storagePath))
    .catch(() => undefined);
}
