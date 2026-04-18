import type { Response } from "express";

export function sendSuccess<TData>(
  response: Response,
  data: TData,
  meta?: Record<string, unknown>
) {
  return response.status(200).json({
    success: true,
    data,
    ...(meta ? { meta } : {})
  });
}

export function sendCreated<TData>(response: Response, data: TData) {
  return response.status(201).json({
    success: true,
    data
  });
}
