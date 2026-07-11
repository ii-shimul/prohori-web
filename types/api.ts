export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
  correlationId?: string;
}

export interface ApiResponseMeta {
  correlationId?: string;
}
