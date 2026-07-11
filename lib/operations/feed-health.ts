export type FeedFreshness = "fresh" | "degraded" | "stale";
export type FeedIssueKind = "MISSING_FIELDS" | "SEQUENCE_GAP" | "DUPLICATE_REPLAY" | "OUT_OF_ORDER" | "MISMATCH" | "CONFLICT";

export type FeedHealthIncident = {
  id: string;
  source: string;
  freshness: FeedFreshness;
  lag: string;
  issue: FeedIssueKind;
  affectedScope: string;
  observedAt: string;
  confidenceEffect: string;
  detail: string;
  safeNextStep: string;
};

export type FeedHealthFilters = { view: "default" | "loading" | "empty" | "error" };

const fixtureIncidents: readonly FeedHealthIncident[] = [
  {
    id: "feed-c-balance-conflict",
    source: "Provider A balance snapshot",
    freshness: "stale",
    lag: "6 hours 15 minutes",
    issue: "CONFLICT",
    affectedScope: "Banani Lake Road Counter",
    observedAt: "2026-07-11T09:34:00.000Z",
    confidenceEffect: "Critical: exact forecast withheld",
    detail: "Latest snapshot conflicts with the last accepted balance record. Out-of-order delivery remains possible.",
    safeNextStep: "Verify source availability and reconcile accepted sequence before using forecast output.",
  },
  {
    id: "feed-c-sequence-gap",
    source: "Provider A transaction feed",
    freshness: "degraded",
    lag: "42 minutes",
    issue: "SEQUENCE_GAP",
    affectedScope: "Dhaka North region aggregate",
    observedAt: "2026-07-11T09:31:00.000Z",
    confidenceEffect: "Reduced: transaction evidence may be incomplete",
    detail: "Sequence range 8842–8849 did not arrive before later records were accepted.",
    safeNextStep: "Request replay or confirm records were not emitted before relying on velocity evidence.",
  },
  {
    id: "feed-c-replay",
    source: "Provider A event gateway",
    freshness: "fresh",
    lag: "4 minutes",
    issue: "DUPLICATE_REPLAY",
    affectedScope: "3 outlet events",
    observedAt: "2026-07-11T09:28:00.000Z",
    confidenceEffect: "Degraded: duplicate events excluded from review",
    detail: "Three identical event IDs were replayed after gateway retry. No financial conclusion is implied.",
    safeNextStep: "Confirm replay handling and keep deduplication evidence with incident review.",
  },
];

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseFeedHealthFilters(searchParams: Record<string, string | string[] | undefined>): FeedHealthFilters {
  const view = firstValue(searchParams.view);
  return { view: view === "loading" || view === "empty" || view === "error" ? view : "default" };
}

export async function getFeedHealthIncidents(): Promise<readonly FeedHealthIncident[]> {
  return fixtureIncidents;
}
