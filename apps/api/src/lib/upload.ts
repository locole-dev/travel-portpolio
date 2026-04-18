import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import multer from "multer";

import { env } from "../config/env.js";
import { AppError } from "./errors.js";

fs.mkdirSync(env.uploadsDir, { recursive: true });

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml"
]);

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, env.uploadsDir);
  },
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname) || ".bin";
    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: env.maxUploadSizeBytes
  },
  fileFilter: (_request, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new AppError(422, "INVALID_FILE_TYPE", "Only image uploads are allowed.")
      );
      return;
    }

    callback(null, true);
  }
});
