import { ApiError } from "./api-error";
import { handleMockApiRequest } from "./mock-api";

const DEFAULT_API_BASE = "http://localhost:4000/api/v1";

const rawApiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "").trim() ?? "";
/** Empty env becomes default; relative paths like `/api/v1` are valid for `fetch`. */
const API_BASE_URL = rawApiBase || DEFAULT_API_BASE;

function resolveApiOrigin(base: string): string {
  if (/^https?:\/\//i.test(base)) {
    try {
      return new URL(base).origin;
    } catch {
      /* malformed absolute URL — fall back to current page origin */
    }
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:5173";
}

const API_ORIGIN = resolveApiOrigin(API_BASE_URL);
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
