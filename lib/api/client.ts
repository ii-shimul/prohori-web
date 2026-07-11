import type { ApiError } from "@/types/api";

export class ApiClientError extends Error {
  readonly status: number;
  readonly correlationId?: string;

  constructor(status: number, payload: ApiError) {
    super(payload.message);
    this.name = "ApiClientError";
    this.status = status;
    this.correlationId = payload.correlationId;
  }
}

export async function apiRequest<T>(
  path: string,
  accessToken: string,
  init: RequestInit = {},
): Promise<T> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  const response = await fetch(new URL(path, apiBaseUrl), {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({
      code: "API_REQUEST_FAILED",
      message: "API request failed. Try again or contact support.",
    }))) as ApiError;

    throw new ApiClientError(response.status, payload);
  }

  return (await response.json()) as T;
}
