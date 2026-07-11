import { supabase } from "@/lib/supabase/minimal-client";
import { buildApiUrl, createCorrelationId } from "./url";

const API_BASE_URL = process.env.NEXT_PUBLIC_PROHORI_API_URL || "http://localhost:3000/api/v1";

export async function minimalApiRequest<T>(
  path: string,
  options: RequestInit & {
    query?: Record<string, string | number | boolean | undefined>;
    idempotencyKey?: string;
  } = {}
): Promise<T> {
  const sessionResult = await supabase.auth.getSession();
  const token = sessionResult.data.session?.access_token;

  const url = buildApiUrl(path, API_BASE_URL);
  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("X-Correlation-Id", createCorrelationId());
  if (options.idempotencyKey) {
    headers.set("Idempotency-Key", options.idempotencyKey);
  }
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(errorBody.message || `API error: ${response.status}`);
    (error as any).status = response.status;
    (error as any).code = errorBody.code;
    throw error;
  }

  if (response.status === 204) {
    return undefined as any;
  }

  return response.json();
}
