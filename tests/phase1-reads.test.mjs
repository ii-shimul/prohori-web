import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function loadModule(relativePath) {
  const source = await readFile(path.join(root, relativePath), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(output).toString("base64")}`);
}

test("Phase 1 production read slices and preview fixture boundaries remain explicit", async () => {
  const [alerts, outlets, outletDetail, cases, feedHealth, readiness, operationsView] = await Promise.all([
    readFile(path.join(root, "lib/operations/alerts.ts"), "utf8"),
    readFile(path.join(root, "lib/operations/outlets.ts"), "utf8"),
    readFile(path.join(root, "lib/operations/outlet-detail.ts"), "utf8"),
    readFile(path.join(root, "lib/operations/cases.ts"), "utf8"),
    readFile(path.join(root, "lib/operations/feed-health.ts"), "utf8"),
    readFile(path.join(root, "lib/operations/readiness.ts"), "utf8"),
    readFile(path.join(root, "components/dashboard/operations-view.tsx"), "utf8"),
  ]);

  assert.match(alerts, /apiRequest<readonly ApiAlert\[]>\("alerts"/);
  assert.match(outlets, /outlets\/\$\{outlet\.id\}\/forecasts/);
  assert.match(outletDetail, /outlets\/\$\{encodeURIComponent\(outletId\)\}\/transactions/);
  assert.match(cases, /cases\/\$\{encodeURIComponent\(caseId\)\}\/timeline/);
  assert.match(feedHealth, /data-quality\/incidents/);
  assert.match(readiness, /management\/readiness/);
  assert.match(operationsView, /minimalApiRequest/);
});

test("Phase 1 fixture adapters remain usable without API imports", async () => {
  const feedHealth = await loadModule("lib/operations/feed-health.ts");
  const readiness = await loadModule("lib/operations/readiness.ts");

  assert.equal((await feedHealth.getFeedHealthIncidents()).length, 3);
  assert.equal((await readiness.getManagementReadiness()).criticalIncidents, 1);
});
