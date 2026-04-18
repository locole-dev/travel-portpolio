import "dotenv/config";

import path from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value === "true";
  }

  return false;
}, z.boolean());

const csvUrlsFromEnv = z.preprocess((value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}, z.array(z.string().url()));

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  APP_ORIGIN: z.string().url().default("http://localhost:5173"),
  APP_ORIGINS: csvUrlsFromEnv.default([]),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters."),
  JWT_EXPIRES_IN: z.string().default("12h"),
  COOKIE_NAME: z.string().default("twentynine_admin_token"),
  COOKIE_SECURE: booleanFromEnv.default(false),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().positive().default(5),
  SEED_ADMIN_EMAIL: z.string().email().default("admin@twentyninehomestay.local"),
  SEED_ADMIN_PASSWORD: z.string().min(8).default("ChangeMe123!")
});

const parsed = envSchema.parse(process.env);
const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

export const env = {
  ...parsed,
  appOrigins: parsed.APP_ORIGINS.length > 0 ? parsed.APP_ORIGINS : [parsed.APP_ORIGIN],
  packageRoot,
  uploadsDir: path.resolve(packageRoot, "uploads"),
  maxUploadSizeBytes: parsed.MAX_UPLOAD_SIZE_MB * 1024 * 1024
};
