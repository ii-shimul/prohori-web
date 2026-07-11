export type FeedFreshness = "fresh" | "degraded" | "stale";
export type FeedIssueKind = string;

export type FeedHealthIncident = {
  id: string;
  source: string;
  freshness: FeedFreshness | null;
  lag: string | null;
  issue: FeedIssueKind;
  affectedScope: string;
  observedAt: string;
  confidenceEffect: string | null;
  detail: string;
  safeNextStep: string | null;
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

type FeedHealthSource = "fixture" | "api";
type ApiFeedHealth = import("@/lib/api/generated").components["schemas"]["FeedHealthPage"];
type ApiIncidentPage = import("@/lib/api/generated").components["schemas"]["DataQualityIncidentPage"];
type ApiProvider = import("@/lib/api/generated").components["schemas"]["Provider"];
type ApiOutlet = import("@/lib/api/generated").components["schemas"]["Outlet"];

export async function getFeedHealthIncidents(source: FeedHealthSource = "fixture"): Promise<readonly FeedHealthIncident[]> {
  if (source === "api") {
    const { apiRequest } = await import("@/lib/api/client");
    const accessToken = await requireAccessToken();
    const [feedHealth, incidents, providers, outlets] = await Promise.all([
      apiRequest<ApiFeedHealth>("feed-health", accessToken),
      apiRequest<ApiIncidentPage>("data-quality/incidents", accessToken),
      apiRequest<readonly ApiProvider[]>("providers", accessToken),
      apiRequest<readonly ApiOutlet[]>("outlets", accessToken),
    ]);
    const providerById = new Map(providers.map((provider) => [provider.id, provider]));
    const outletById = new Map(outlets.map((outlet) => [outlet.id, outlet]));
    return incidents.items.map((incident) => {
      const provider = incident.providerId ? providerById.get(incident.providerId) : undefined;
      const outlet = incident.outletId ? outletById.get(incident.outletId) : undefined;
      const health = incident.providerId ? feedHealth.items.find((item) => item.providerId === incident.providerId) : undefined;
      const details = (incident.details ?? {}) as Record<string, unknown>;

      const detail =
        typeof details.description === "string" ? details.description
        : typeof details.message === "string" ? details.message
        : typeof details.reason === "string" ? details.reason
        : `${incident.category.replace(/_/g, " ")} incident detected.`;

      const safeNextStep =
        typeof details.nextStep === "string" ? details.nextStep
        : incident.category === "STALE" ? "Verify source availability before relying on forecast output."
        : incident.category === "DUPLICATE" ? "Confirm replay handling and keep deduplication evidence with incident review."
        : incident.category === "SEQUENCE_GAP" ? "Request replay or confirm records were not emitted before relying on velocity evidence."
        : incident.category === "CONFLICT" ? "Reconcile accepted sequence before using forecast output."
        : "Verify data before relying on any forecast or escalating the case.";

      const lagSeconds = typeof details.lagSeconds === "number" ? details.lagSeconds : null;
      const lag = lagSeconds != null
        ? lagSeconds >= 3600
          ? `${Math.floor(lagSeconds / 3600)} hr ${Math.floor((lagSeconds % 3600) / 60)} min`
          : `${Math.floor(lagSeconds / 60)} min`
        : null;

      return {
        id: incident.id,
        source: provider?.name ?? (incident.providerId ? `Provider ${incident.providerId.slice(0, 8)}\u2026` : "Provider not specified"),
        freshness: health ? toFreshness(health.dataQuality) : null,
        lag,
        issue: incident.category,
        affectedScope: outlet?.name ?? (incident.outletId ? `Outlet ${incident.outletId.slice(0, 8)}\u2026` : "Scope not specified"),
        observedAt: incident.detectedAt,
        confidenceEffect: health ? `${health.dataQuality === "healthy" ? "Normal" : health.dataQuality === "degraded" ? "Reduced" : "Critical"}: confidence affected` : null,
        detail,
        safeNextStep,
      };
    });
  }

  return fixtureIncidents;
}

function toFreshness(value: ApiFeedHealth["items"][number]["dataQuality"]): FeedFreshness {
  return value === "healthy" ? "fresh" : value === "degraded" ? "degraded" : "stale";
}

async function requireAccessToken(): Promise<string> {
  const { getVerifiedAccessToken } = await import("@/lib/auth/session");
  const token = await getVerifiedAccessToken();
  if (!token) throw new Error("Authenticated API read requires a verified Supabase access token.");
  return token;
}
