import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function loadRolesModule() {
  const source = await readFile(path.join(root, "lib/auth/api-roles.ts"), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(output).toString("base64")}`);
}

test("API memberships and assignments produce stable role authority", async () => {
  const { getApiRoles, hasAnyApiRole } = await loadRolesModule();
  const user = {
    memberships: [{ role: "PROVIDER_OPERATIONS" }, { role: "DEMO_ADMIN" }],
    assignments: [{ role: "DATA_STEWARD" }, { role: "PROVIDER_OPERATIONS" }],
  };

  assert.deepEqual(getApiRoles(user), ["DEMO_ADMIN", "DATA_STEWARD", "PROVIDER_OPERATIONS"]);
  assert.equal(hasAnyApiRole(user, ["PLATFORM_MANAGEMENT", "DATA_STEWARD"]), true);
  assert.equal(hasAnyApiRole(user, ["VALIDATION_AUDITOR"]), false);
});
