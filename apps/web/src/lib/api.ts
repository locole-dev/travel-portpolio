import { ApiError } from "./api-error";
import { handleMockApiRequest } from "./mock-api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:4000/api/v1";

const API_ORIGIN = new URL(API_BASE_URL).origin;
const MOCK_API_ENABLED = import.meta.env.VITE_ENABLE_MOCK_API === "true";

type ApiEnvelope<TData> = {
  success: boolean;
  data: TData;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export async function apiRequest<TData>(
  path: string,
  init: RequestInit = {}
): Promise<TData> {
  if (MOCK_API_ENABLED) {
    return handleMockApiRequest<TData>(path, init);
  }

  const headers = new Headers(init.headers);
  const isFormData = init.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include"
  });

  const payload = (await response.json()) as ApiEnvelope<TData>;

  if (!response.ok || !payload.success) {
    throw new ApiError(
      payload.error?.message ?? "Request failed.",
      payload.error?.code,
      payload.error?.details
    );
  }

  return payload.data;
}

export function resolveMediaUrl(value?: string | null) {
  if (!value) {
    return "";
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  if (MOCK_API_ENABLED && value.startsWith("/")) {
    return value;
  }

  return `${API_ORIGIN}${value.startsWith("/") ? value : `/${value}`}`;
}

export { API_BASE_URL, MOCK_API_ENABLED };
