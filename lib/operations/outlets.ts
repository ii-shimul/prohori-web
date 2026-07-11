import type { components } from "@/lib/api/generated";
import type { Freshness } from "@/lib/formatters/status";
import type { Provider, RiskLevel } from "@/types/domain";

export type OutletRisk = {
  id: string;
  outletName: string;
  area: string;
  agentName: string;
  provider: Provider | "SHARED";
  limitingResource: string;
  forecastLowMinor: string | null;
  forecastExpectedMinor: string | null;
  forecastHighMinor: string | null;
  thresholdEtaMinutes: number | null;
  risk: RiskLevel;
  confidence: number;
  freshness: Freshness;
  lastActivityHours: number | null;
  openCases: number | null;
  highAlerts: number | null;
};

export type OutletFilters = {
  provider: Provider | "all";
  agent: string | "all";
  area: string | "all";
  time: "4h" | "24h" | "7d";
  risk: RiskLevel | "all";
  freshness: Freshness | "all";
  page: number;
  view: "default" | "loading" | "empty" | "error";
};

type OutletSource = "fixture" | "api";
type ApiOutlet = components["schemas"]["Outlet"];
type ApiProvider = components["schemas"]["Provider"];
type ApiHealth = components["schemas"]["OutletHealth"];
type ApiForecastRun = components["schemas"]["ForecastRun"];
type ApiAlert = components["schemas"]["Alert"];
type ApiCase = components["schemas"]["Case"];


export type OutletOverview = {
  kpis: {
    outletsUnderPressure: number;
    highAlerts: number | null;
    staleFeeds: number;
    openCases: number | null;
  };
  items: OutletRisk[];
  total: number;
  pageCount: number;
};

const PAGE_SIZE = 5;
const currentProviderScope: Provider = "PROVIDER_A";

const scopedFixtureOutlets: readonly OutletRisk[] = [
  {
    id: "dha-017",
    outletName: "Dhanmondi 27 Agent Point",
    area: "Dhaka North",
    agentName: "Nusrat Jahan",
    provider: "PROVIDER_A",
    limitingResource: "Provider A e-money",
    forecastLowMinor: "125000",
    forecastExpectedMinor: "165000",
    forecastHighMinor: "205000",
    thresholdEtaMinutes: 38,
    risk: "high",
    confidence: 0.86,
    freshness: "fresh",
    lastActivityHours: 0.3,
    openCases: 1,
    highAlerts: 2,
  },
  {
    id: "mir-042",
    outletName: "Mirpur 10 Service Desk",
    area: "Dhaka North",
    agentName: "Rafiul Islam",
    provider: "PROVIDER_A",
    limitingResource: "Shared physical cash",
    forecastLowMinor: "205000",
    forecastExpectedMinor: "260000",
    forecastHighMinor: "315000",
    thresholdEtaMinutes: 72,
    risk: "high",
    confidence: 0.79,
    freshness: "degraded",
    lastActivityHours: 1.4,
    openCases: 1,
    highAlerts: 1,
  },
  {
    id: "utt-031",
    outletName: "Uttara Sector 7 Booth",
    area: "Dhaka North",
    agentName: "Salma Akter",
    provider: "PROVIDER_A",
    limitingResource: "Provider A e-money",
    forecastLowMinor: "450000",
    forecastExpectedMinor: "520000",
    forecastHighMinor: "600000",
    thresholdEtaMinutes: 168,
    risk: "medium",
    confidence: 0.74,
    freshness: "fresh",
    lastActivityHours: 0.8,
    openCases: 0,
    highAlerts: 0,
  },
  {
    id: "ban-008",
    outletName: "Banani Lake Road Counter",
    area: "Dhaka North",
    agentName: "Tanvir Hasan",
    provider: "PROVIDER_A",
    limitingResource: "Shared physical cash",
    forecastLowMinor: "380000",
    forecastExpectedMinor: "440000",
    forecastHighMinor: "510000",
    thresholdEtaMinutes: null,
    risk: "medium",
    confidence: 0.43,
    freshness: "stale",
    lastActivityHours: 6.2,
    openCases: 1,
    highAlerts: 0,
  },
  {
    id: "gul-014",
    outletName: "Gulshan 2 Merchant Hub",
    area: "Dhaka North",
    agentName: "Mithila Saha",
    provider: "PROVIDER_A",
    limitingResource: "Provider A e-money",
    forecastLowMinor: "760000",
    forecastExpectedMinor: "840000",
    forecastHighMinor: "930000",
    thresholdEtaMinutes: null,
    risk: "low",
    confidence: 0.91,
    freshness: "fresh",
    lastActivityHours: 2.6,
    openCases: 0,
    highAlerts: 0,
  },
  {
    id: "moh-023",
    outletName: "Mohammadpur Town Hall Point",
    area: "Dhaka North",
    agentName: "Farhana Rahman",
    provider: "PROVIDER_A",
    limitingResource: "Shared physical cash",
    forecastLowMinor: "525000",
    forecastExpectedMinor: "570000",
    forecastHighMinor: "620000",
    thresholdEtaMinutes: 245,
    risk: "low",
    confidence: 0.88,
    freshness: "fresh",
    lastActivityHours: 3.2,
    openCases: 0,
    highAlerts: 0,
  },
];

function parseEnum<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && allowed.includes(candidate as T) ? (candidate as T) : fallback;
}

function parsePage(value: string | string[] | undefined): number {
  const candidate = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(candidate) && candidate > 0 ? candidate : 1;
}

export function parseOutletFilters(searchParams: Record<string, string | string[] | undefined>): OutletFilters {
  return {
    provider: parseEnum(searchParams.provider, ["all", "PROVIDER_A", "PROVIDER_B", "PROVIDER_C"], "all"),
    agent: "all",
    area: parseEnum(searchParams.area, ["all", ...scopedFixtureOutlets.map((item) => item.area)], "all"),
    time: parseEnum(searchParams.time, ["4h", "24h", "7d"], "24h"),
    risk: parseEnum(searchParams.risk, ["all", "low", "medium", "high"], "all"),
    freshness: parseEnum(searchParams.freshness, ["all", "fresh", "degraded", "stale"], "all"),
    page: parsePage(searchParams.page),
    view: parseEnum(searchParams.view, ["default", "loading", "empty", "error"], "default"),
  };
}

export async function getOutletFilterOptions(source: OutletSource = "fixture") {
  if (source === "api") {
    const { apiRequest } = await import("@/lib/api/client");
    const accessToken = await requireAccessToken();
    const outlets = await apiRequest<readonly ApiOutlet[]>("outlets", accessToken);
    return { agents: [], areas: [...new Set(outlets.map((item) => item.area.name))] };
  }

  return {
    agents: [...new Set(scopedFixtureOutlets.map((item) => item.agentName))],
    areas: [...new Set(scopedFixtureOutlets.map((item) => item.area))],
  };
}

export async function getOutletOverview(filters: OutletFilters, source: OutletSource = "fixture"): Promise<OutletOverview> {
  if (source === "api") return getApiOutletOverview(filters);

  const timeLimitHours = filters.time === "4h" ? 4 : filters.time === "24h" ? 24 : 168;
  const filtered = scopedFixtureOutlets
    .filter((item) => item.provider === currentProviderScope)
    .filter((item) => filters.provider === "all" || item.provider === filters.provider)
    .filter((item) => filters.agent === "all" || item.agentName === filters.agent)
    .filter((item) => filters.area === "all" || item.area === filters.area)
    .filter((item) => filters.risk === "all" || item.risk === filters.risk)
    .filter((item) => filters.freshness === "all" || item.freshness === filters.freshness)
    .filter((item) => item.lastActivityHours === null || item.lastActivityHours <= timeLimitHours)
    .toSorted((left, right) => {
      const riskOrder: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 };
      return (
        riskOrder[left.risk] - riskOrder[right.risk] ||
        (left.thresholdEtaMinutes ?? Number.POSITIVE_INFINITY) -
          (right.thresholdEtaMinutes ?? Number.POSITIVE_INFINITY)
      );
    });
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const start = (page - 1) * PAGE_SIZE;

  return {
    kpis: {
      outletsUnderPressure: scopedFixtureOutlets.filter((item) => item.risk === "high").length,
      highAlerts: scopedFixtureOutlets.reduce((total, item) => total + (item.highAlerts ?? 0), 0),
      staleFeeds: scopedFixtureOutlets.filter((item) => item.freshness === "stale").length,
      openCases: scopedFixtureOutlets.reduce((total, item) => total + (item.openCases ?? 0), 0),
    },
    items: filtered.slice(start, start + PAGE_SIZE),
    total: filtered.length,
    pageCount,
  };
}

async function getApiOutletOverview(filters: OutletFilters): Promise<OutletOverview> {
  const [{ apiRequest }, { getVerifiedAccessToken }] = await Promise.all([
    import("@/lib/api/client"),
    import("@/lib/auth/session"),
  ]);
  const accessToken = await getVerifiedAccessToken();
  if (!accessToken) throw new Error("Authenticated API read requires a verified Supabase access token.");

  // Core outlet + provider data — must succeed for the dashboard to render.
  const [outlets, providers] = await Promise.all([
    apiRequest<readonly ApiOutlet[]>("outlets", accessToken),
    apiRequest<readonly ApiProvider[]>("providers", accessToken),
  ]);

  // Per-outlet health + forecast — run concurrently; individual failures surface as errors.
  const providerById = new Map(providers.map((provider) => [provider.id, provider.code]));
  const items = await Promise.all(outlets.map(async (outlet) => {
    const [health, forecast] = await Promise.all([
      apiRequest<ApiHealth>(`outlets/${outlet.id}/health`, accessToken),
      apiRequest<ApiForecastRun>(`outlets/${outlet.id}/forecasts`, accessToken),
    ]);
    return toOutletRisk(outlet, health, forecast, providerById);
  }));

  // KPI supplementary counts — optional; dashboard still renders if these fail.
  const [alertsResult, casesResult] = await Promise.allSettled([
    apiRequest<readonly ApiAlert[]>("alerts", accessToken, { query: { active: "true" } }),
    apiRequest<readonly ApiCase[]>("cases", accessToken),
  ]);
  const highAlerts = alertsResult.status === "fulfilled"
    ? alertsResult.value.filter((a) => a.severity === "high" || a.severity === "critical").length
    : null;
  const openCases = casesResult.status === "fulfilled"
    ? casesResult.value.filter((c) => c.state !== "RESOLVED" && c.state !== "CLOSED").length
    : null;

  const filtered = items
    .filter((item) => filters.provider === "all" || item.provider === filters.provider)
    .filter((item) => filters.area === "all" || item.area === filters.area)
    .filter((item) => filters.risk === "all" || item.risk === filters.risk)
    .filter((item) => filters.freshness === "all" || item.freshness === filters.freshness)
    .toSorted((left, right) => riskOrder(right) - riskOrder(left) || (left.thresholdEtaMinutes ?? Infinity) - (right.thresholdEtaMinutes ?? Infinity));
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const start = (page - 1) * PAGE_SIZE;

  return {
    kpis: {
      outletsUnderPressure: items.filter((item) => item.risk === "high").length,
      highAlerts,
      staleFeeds: items.filter((item) => item.freshness === "stale").length,
      openCases,
    },
    items: filtered.slice(start, start + PAGE_SIZE),
    total: filtered.length,
    pageCount,
  };
}

function toOutletRisk(outlet: ApiOutlet, health: ApiHealth, forecast: ApiForecastRun, providerById: Map<string, Provider>): OutletRisk {
  const limitingResource = health.limitingResource;
  const resource = forecast.resources.find((item) => item.resource === limitingResource?.resource && item.providerId === limitingResource?.providerId) ?? forecast.resources[0];
  const point = resource?.points.at(-1);
  const provider = limitingResource?.providerId ? providerById.get(limitingResource.providerId) ?? "SHARED" : "SHARED";
  return {
    id: outlet.id,
    outletName: outlet.name,
    area: outlet.area.name,
    agentName: "Not provided by API",
    provider,
    limitingResource: limitingResource?.resource === "provider_efloat" ? "Provider e-money" : "Shared physical cash",
    forecastLowMinor: point?.projectedLowMinor ?? null,
    forecastExpectedMinor: point?.projectedMidMinor ?? null,
    forecastHighMinor: point?.projectedHighMinor ?? null,
    thresholdEtaMinutes: point?.reserveEtaMinutes ?? null,
    risk: toRisk(point?.riskBand),
    confidence: health.modelConfidence,
    freshness: toFreshness(health.dataQuality),
    lastActivityHours: null,
    openCases: null,
    highAlerts: null,
  };
}

function riskOrder(item: OutletRisk): number {
  return item.risk === "high" ? 3 : item.risk === "medium" ? 2 : 1;
}

function toRisk(value: ApiForecastRun["resources"][number]["points"][number]["riskBand"] | undefined): RiskLevel {
  return value === "high" || value === "critical" ? "high" : value === "moderate" ? "medium" : "low";
}

function toFreshness(value: ApiHealth["dataQuality"]): Freshness {
  return value === "healthy" ? "fresh" : value === "degraded" ? "degraded" : "stale";
}

async function requireAccessToken(): Promise<string> {
  const { getVerifiedAccessToken } = await import("@/lib/auth/session");
  const token = await getVerifiedAccessToken();
  if (!token) throw new Error("Authenticated API read requires a verified Supabase access token.");
  return token;
}
