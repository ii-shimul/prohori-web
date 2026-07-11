export const scenarioCodes = ["A", "B", "C", "D"] as const;
export type ScenarioCode = (typeof scenarioCodes)[number];
export type ScenarioStage = "baseline" | "started" | "step-1" | "step-2";

export type SimulationScenario = {
  code: ScenarioCode;
  title: string;
  description: string;
  steps: readonly string[];
  evidenceHref: string;
  evidenceLabel: string;
};

export const simulationScenarios: readonly SimulationScenario[] = [
  { code: "A", title: "Constrained Resource & Stale Feed", description: "Review constrained provider resource, stale source, lower confidence, and withheld certainty without offering a financial action.", steps: ["Start scenario", "Review outlet uncertainty"], evidenceHref: "/preview/operations/outlets/ban-008", evidenceLabel: "Open Scenario A Outlet" },
  { code: "B", title: "Liquidity & Activity Review", description: "Review liquidity pressure and unusual activity separately. Combined review is correlation only, never causal proof.", steps: ["Start scenario", "Review evidence signals"], evidenceHref: "/preview/operations/alerts", evidenceLabel: "Open Scenario B Alerts" },
  { code: "C", title: "Data Inconsistency", description: "Review stale conflicting feed, sequence gap, and replay evidence. Exact forecast remains withheld.", steps: ["Start scenario", "Verify data-quality evidence"], evidenceHref: "/preview/operations/feed-health", evidenceLabel: "Open Scenario C Feed Health" },
  { code: "D", title: "Case Lifecycle", description: "Open case and move through acknowledgement, investigation, escalation, resolution, and closure with audit evidence.", steps: ["Start scenario", "Run case workflow"], evidenceHref: "/preview/operations/cases/case-204", evidenceLabel: "Open Scenario D Case" },
];

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseSimulationState(searchParams: Record<string, string | string[] | undefined>) {
  const scenarioValue = firstValue(searchParams.scenario);
  const stageValue = firstValue(searchParams.stage);
  const scenario = scenarioCodes.includes(scenarioValue as ScenarioCode) ? (scenarioValue as ScenarioCode) : "A";
  const stage: ScenarioStage = stageValue === "started" || stageValue === "step-1" || stageValue === "step-2" ? stageValue : "baseline";
  return { scenario, stage };
}
