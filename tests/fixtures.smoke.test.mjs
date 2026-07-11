import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function loadFixtureModule(relativePath) {
  const source = await readFile(path.join(root, relativePath), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(output).toString("base64")}`);
}

test("dashboard filters preserve Provider A fixture scope and high-risk ordering", async () => {
  const { getOutletOverview, parseOutletFilters } = await loadFixtureModule("lib/operations/outlets.ts");
  const filters = parseOutletFilters({ provider: "PROVIDER_A", risk: "high", freshness: "all", time: "24h" });
  const overview = await getOutletOverview(filters);

  assert.equal(filters.provider, "PROVIDER_A");
  assert.equal(overview.total, 2);
  assert.ok(overview.items.every((outlet) => outlet.provider === "PROVIDER_A" && outlet.risk === "high"));
  assert.equal(overview.items[0].id, "dha-017");
});

test("unsupported provider filter cannot reveal fixture data", async () => {
  const { getOutletOverview, parseOutletFilters } = await loadFixtureModule("lib/operations/outlets.ts");
  const overview = await getOutletOverview(parseOutletFilters({ provider: "PROVIDER_B" }));
  assert.equal(overview.total, 0);
  assert.equal(overview.items.length, 0);
});

test("Scenario A suppresses exact forecast for stale conflicting outlet", async () => {
  const { getOutletDetail } = await loadFixtureModule("lib/operations/outlet-detail.ts");
  const outlet = await getOutletDetail("ban-008");
  assert.equal(outlet?.freshness, "stale");
  assert.equal(outlet?.dataQuality, "critical");
  assert.equal(outlet?.forecast, null);
  assert.equal(outlet?.thresholdEtaMinutes, null);
});

test("Scenarios B and C expose separate alert evidence without cross-provider data", async () => {
  const { getAlert, getAlerts, parseAlertFilters } = await loadFixtureModule("lib/operations/alerts.ts");
  const scenarioB = await getAlerts(parseAlertFilters({ severity: "HIGH" }));
  const scenarioC = await getAlert("alert-c-inconsistency");

  assert.deepEqual(scenarioB.map((alert) => alert.id), ["alert-b-review", "alert-b-liquidity", "alert-b-activity"]);
  assert.ok(scenarioB.every((alert) => alert.provider === "PROVIDER_A"));
  assert.equal(scenarioC?.dataQuality, "critical");
  assert.equal(scenarioC?.type, "DATA_INCONSISTENCY");
  assert.equal(await getAlert("other-provider-alert"), null);
});

test("Scenario D starts provider-scoped case with linked combined-review alert", async () => {
  const { getCase, getCases } = await loadFixtureModule("lib/operations/cases.ts");
  const caseRecord = await getCase("case-204");
  const cases = await getCases();

  assert.equal(caseRecord?.state, "OPEN");
  assert.equal(caseRecord?.alertId, "alert-b-review");
  assert.ok(cases.every((item) => item.provider === "PROVIDER_A"));
  assert.equal(await getCase("other-provider-case"), null);
});

test("simulation links all deterministic scenarios to evidence routes", async () => {
  const { simulationScenarios, parseSimulationState } = await loadFixtureModule("lib/operations/simulation.ts");
  assert.deepEqual(simulationScenarios.map((scenario) => scenario.code), ["A", "B", "C", "D"]);
  assert.ok(simulationScenarios.every((scenario) => scenario.evidenceHref.startsWith("/preview/operations/")));
  assert.deepEqual(parseSimulationState({ scenario: "D", stage: "step-2" }), { scenario: "D", stage: "step-2" });
});

test("auth and no-action guardrails remain present", async () => {
  const [proxy, loginAction, dashboardActions, localeSwitcher, ui] = await Promise.all([
    readFile(path.join(root, "proxy.ts"), "utf8"),
    readFile(path.join(root, "app/(auth)/login/actions.ts"), "utf8"),
    readFile(path.join(root, "app/(dashboard)/actions.ts"), "utf8"),
    readFile(path.join(root, "components/layout/locale-switcher.tsx"), "utf8"),
    readFile(path.join(root, "components/simulation/simulation-view.tsx"), "utf8"),
  ]);

  assert.match(proxy, /supabase\.auth\.getClaims\(\)/);
  assert.match(proxy, /NextResponse\.redirect\(new URL\("\/login"/);
  assert.match(loginAction, /signInWithPassword/);
  assert.match(dashboardActions, /await requireAuth\(\)/);
  assert.match(localeSwitcher, /document\.cookie/);
  assert.doesNotMatch(`${proxy}\n${loginAction}\n${dashboardActions}\n${localeSwitcher}\n${ui}`, /localStorage/);
  assert.doesNotMatch(ui, /transfer|refill|freeze|block|fraud verdict/i);
});
