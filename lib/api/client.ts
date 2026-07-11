import { ApiClientError, toApiError } from "@/lib/api/errors";
import { buildApiUrl, createCorrelationId } from "@/lib/api/url";

const API_REQUEST_TIMEOUT_MS = 10_000;

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
  const requestCorrelationId = correlationId ?? createCorrelationId();
  const headers = new Headers(requestHeaders);

  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${accessToken}`);
  headers.set("X-Correlation-Id", requestCorrelationId);

  if (idempotencyKey) {
    headers.set("Idempotency-Key", idempotencyKey);
  }

  if (requestInit.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort();
  requestInit.signal?.addEventListener("abort", abortFromCaller, { once: true });

  let response: Response;
  try {
    response = await fetch(buildApiUrl(path, apiBaseUrl), {
      ...requestInit,
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (error) {
    if (controller.signal.aborted && !requestInit.signal?.aborted) {
      throw new ApiClientError(503, {
        code: "API_UNAVAILABLE",
        correlationId: requestCorrelationId,
        message: "Prohori API did not respond within 10 seconds. Check API availability, then try again.",
      });
    }

    throw error;
  } finally {
    clearTimeout(timeout);
    requestInit.signal?.removeEventListener("abort", abortFromCaller);
  }

  if (!response.ok) {
    throw new ApiClientError(response.status, await toApiError(response));
  }

  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}
