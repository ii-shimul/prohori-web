export type Freshness = "fresh" | "degraded" | "stale";

const freshnessLabels: Record<Freshness, string> = {
  fresh: "Fresh",
  degraded: "Degraded",
  stale: "Stale",
};

export function formatFreshness(value: Freshness): string {
  return freshnessLabels[value];
}
