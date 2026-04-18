export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code = "API_ERROR",
    public readonly details?: unknown
  ) {
    super(message);
  }
}
