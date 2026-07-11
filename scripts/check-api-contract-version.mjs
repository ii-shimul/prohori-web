import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [source, generatedVersion] = await Promise.all([
  readFile(path.resolve(root, "..", "prohori-api", "openapi.yaml"), "utf8"),
  readFile(path.join(root, "lib", "api", "contract-version.ts"), "utf8"),
]);
const sourceVersion = source.match(/^  version: ([^\r\n]+)$/m)?.[1]?.trim();
const generatedContractVersion = generatedVersion.match(/API_CONTRACT_VERSION = "([^"]+)"/)?.[1];

if (!sourceVersion || sourceVersion !== generatedContractVersion) {
  throw new Error(
    `API contract version drift: OpenAPI=${sourceVersion ?? "missing"}, web=${generatedContractVersion ?? "missing"}. Run npm run generate:api.`,
  );
}
