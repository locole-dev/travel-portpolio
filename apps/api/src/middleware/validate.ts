import type { NextFunction, Request, Response } from "express";

import type { ZodTypeAny } from "zod";
import { ZodError } from "zod";

import { AppError } from "../lib/errors.js";

type ValidationShape = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

function toDetails(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message
  }));
}

export function validateRequest(shape: ValidationShape) {
  return (request: Request, _response: Response, next: NextFunction) => {
    try {
      if (shape.body) {
        request.body = shape.body.parse(request.body);
      }

      if (shape.params) {
        request.params = shape.params.parse(request.params);
      }

      if (shape.query) {
        request.query = shape.query.parse(request.query) as Request["query"];
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new AppError(
            422,
            "VALIDATION_ERROR",
            "Request validation failed.",
            toDetails(error)
          )
        );
        return;
      }

      next(error);
    }
  };
}
