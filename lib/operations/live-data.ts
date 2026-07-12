import type { Freshness } from "@/lib/formatters/status";
import type { RiskLevel } from "@/types/domain";

export function mapFreshness(value: string | undefined): Freshness {
  switch (value) {
    case "healthy":
      return "fresh";
    case "degraded":
      return "degraded";
    default:
      return "stale";
  }
}

export function mapAlertSeverity(value: string | undefined): "LOW" | "MEDIUM" | "HIGH" {
  switch (value) {
    case "low":
      return "LOW";
    case "moderate":
      return "MEDIUM";
    default:
      return "HIGH";
  }
}

export function mapAlertStatus(value: string | undefined): "active" | "acknowledged" | "escalated" | "resolved" {
  switch (value) {
    case "open":
      return "active";
    case "acknowledged":
      return "acknowledged";
    case "assigned":
    case "case_created":
      return "escalated";
    default:
      return "resolved";
  }
}

export function toRiskLevel(value: string | undefined): RiskLevel {
  if (value === "high" || value === "critical") return "high";
  if (value === "moderate") return "medium";
  return "low";
}
