import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.resolve(root, "..", "prohori-api", "openapi.yaml");
const targetPath = path.join(root, "lib", "api", "contract-version.ts");
const source = await readFile(sourcePath, "utf8");
const version = source.match(/^  version: ([^\r\n]+)$/m)?.[1]?.trim();

if (!version) {
  throw new Error("Could not read OpenAPI info.version.");
}

await writeFile(
  targetPath,
  `// Generated from ../prohori-api/openapi.yaml. Do not edit manually.\nexport const API_CONTRACT_VERSION = ${JSON.stringify(version)} as const;\n`,
);
