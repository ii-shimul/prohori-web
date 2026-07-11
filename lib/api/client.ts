import { ApiClientError, toApiError } from "@/lib/api/errors";
import { buildApiUrl, createCorrelationId } from "@/lib/api/url";

export type ApiRequestInit = RequestInit & {
  correlationId?: string;
  idempotencyKey?: string;
};

export async function apiRequest<T>(
  path: string,
  accessToken: string,
  init: ApiRequestInit = {},
): Promise<T> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_PROHORI_API_URL;

  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_PROHORI_API_URL is not configured.");
  }

  const { correlationId, idempotencyKey, headers: requestHeaders, ...requestInit } = init;
  const headers = new Headers(requestHeaders);

  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${accessToken}`);
  headers.set("X-Correlation-Id", correlationId ?? createCorrelationId());

  if (idempotencyKey) {
    headers.set("Idempotency-Key", idempotencyKey);
  }

  if (requestInit.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildApiUrl(path, apiBaseUrl), {
    ...requestInit,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiClientError(response.status, await toApiError(response));
  }

  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}
