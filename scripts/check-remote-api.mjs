import { readFile } from "node:fs/promises";

function parseEnvFile(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        return separator === -1 ? [line, ""] : [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

let localEnv = {};
try {
  localEnv = parseEnvFile(await readFile(new URL("../.env.local", import.meta.url), "utf8"));
} catch {
  // CI and deployed environments provide variables through process.env.
}

const apiBaseUrl = process.env.NEXT_PUBLIC_PROHORI_API_URL ?? localEnv.NEXT_PUBLIC_PROHORI_API_URL;

if (!apiBaseUrl) {
  throw new Error("NEXT_PUBLIC_PROHORI_API_URL is not configured.");
}

const healthUrl = `${apiBaseUrl.replace(/\/$/, "")}/health/live`;
const response = await fetch(healthUrl, { signal: AbortSignal.timeout(10_000) });
const body = await response.json().catch(() => null);

if (!response.ok || body?.status !== "ok") {
  throw new Error(`Remote API health check failed: HTTP ${response.status} ${healthUrl}`);
}

console.log(`Remote API healthy: ${healthUrl}`);
