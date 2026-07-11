export function buildApiUrl(path: string, apiBaseUrl: string): URL {
  const normalizedBaseUrl = apiBaseUrl.endsWith("/") ? apiBaseUrl : `${apiBaseUrl}/`;
  const normalizedPath = path.replace(/^\/+/, "");

  return new URL(normalizedPath, normalizedBaseUrl);
}

export function createCorrelationId(): string {
  return crypto.randomUUID();
}
