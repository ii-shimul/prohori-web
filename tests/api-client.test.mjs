import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function loadUrlModule() {
  const source = await readFile(path.join(root, "lib/api/url.ts"), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(output).toString("base64")}`);
}

test("API path resolution preserves the /api/v1 prefix", async () => {
  const { buildApiUrl } = await loadUrlModule();
  const baseUrl = "https://prohori-api.onrender.com/api/v1";

  assert.equal(buildApiUrl("me", baseUrl).toString(), "https://prohori-api.onrender.com/api/v1/me");
  assert.equal(buildApiUrl("/me", baseUrl).toString(), "https://prohori-api.onrender.com/api/v1/me");
});

test("generated contract version matches authoritative API OpenAPI", async () => {
  const [openapi, contractVersion] = await Promise.all([
    readFile(path.join(root, "..", "prohori-api", "openapi.yaml"), "utf8"),
    readFile(path.join(root, "lib/api/contract-version.ts"), "utf8"),
  ]);

  const apiVersion = openapi.match(/^  version: ([^\r\n]+)$/m)?.[1]?.trim();
  const webVersion = contractVersion.match(/API_CONTRACT_VERSION = "([^"]+)"/)?.[1];
  assert.equal(webVersion, apiVersion);
});
