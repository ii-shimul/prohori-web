export const providers = ["PROVIDER_A", "PROVIDER_B", "PROVIDER_C"] as const;
export const alertTypes = [
  "LIQUIDITY_PRESSURE",
  "UNUSUAL_ACTIVITY",
  "DATA_INCONSISTENCY",
  "COMBINED_REVIEW",
] as const;
export const severities = ["LOW", "MEDIUM", "HIGH"] as const;
export const caseStates = [
  "OPEN",
  "ACKNOWLEDGED",
  "INVESTIGATING",
  "ESCALATED",
  "RESOLVED",
  "CLOSED",
] as const;

export type Provider = (typeof providers)[number];
export type AlertType = (typeof alertTypes)[number];
export type Severity = (typeof severities)[number];
export type CaseState = (typeof caseStates)[number];

export type RiskLevel = "low" | "medium" | "high";
