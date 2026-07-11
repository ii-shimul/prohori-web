import type { ApiError } from "@/types/api";

const fallbackApiError: ApiError = {
  code: "API_REQUEST_FAILED",
  message: "API request failed. Try again or contact support.",
};

export class ApiClientError extends Error {
  readonly status: number;
  readonly correlationId?: string;
  readonly code: string;
  readonly fieldErrors: Record<string, string[]>;

  constructor(status: number, payload: ApiError) {
    super(payload.message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = payload.code;
    this.correlationId = payload.correlationId;
    this.fieldErrors = payload.fieldErrors ?? {};
  }
}

export async function toApiError(response: Response): Promise<ApiError> {
  const payload = (await response.json().catch(() => fallbackApiError)) as Partial<ApiError>;

  return {
    code: payload.code ?? fallbackApiError.code,
    correlationId: payload.correlationId ?? response.headers.get("X-Correlation-Id") ?? undefined,
    fieldErrors: payload.fieldErrors ?? {},
    message: payload.message ?? fallbackApiError.message,
  };
}
