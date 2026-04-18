import type { NextFunction, Request, Response } from "express";

import { ZodError } from "zod";

import { AppError } from "../lib/errors.js";

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  next: NextFunction
) {
  void next;

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details ?? []
      }
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(422).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        details: error.issues
      }
    });
    return;
  }

  console.error(error);

  response.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong on the server.",
      details: []
    }
  });
}
