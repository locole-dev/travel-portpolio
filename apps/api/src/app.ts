import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { errorHandler } from "./middleware/error-handler.js";
import { createRouter } from "./routes/index.js";

export const app = express();
const allowedOrigins = new Set(env.appOrigins);

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true
  })
);

app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(env.uploadsDir));

app.get("/health", async (_request, response) => {
  const checkedAt = new Date().toISOString();

  try {
    await prisma.$queryRaw`SELECT 1`;

    response.json({
      success: true,
      data: {
        status: "ok",
        checkedAt,
        services: {
          api: "ok",
          database: "ok"
        }
      }
    });
  } catch (error) {
    console.error("Health check failed.", error);

    response.status(503).json({
      success: false,
      error: {
        code: "HEALTHCHECK_FAILED",
        message: "The API is running, but the database connection check failed.",
        details: []
      },
      data: {
        status: "degraded",
        checkedAt,
        services: {
          api: "ok",
          database: "down"
        }
      }
    });
  }
});

app.use(createRouter());
app.use(errorHandler);
