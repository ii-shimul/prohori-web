import type { Freshness } from "@/lib/formatters/status";
import type { Provider, RiskLevel } from "@/types/domain";

export type OutletRisk = {
  id: string;
  outletName: string;
  area: string;
  agentName: string;
  provider: Provider;
  limitingResource: "Provider A e-money" | "Shared physical cash";
  forecastLowMinor: string;
  forecastExpectedMinor: string;
  forecastHighMinor: string;
  thresholdEtaMinutes: number | null;
  risk: RiskLevel;
  confidence: number;
  freshness: Freshness;
  lastActivityHours: number;
  openCases: number;
  highAlerts: number;
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

export type OutletOverview = {
  kpis: {
    outletsUnderPressure: number;
    highAlerts: number;
    staleFeeds: number;
    openCases: number;
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
    agent: parseEnum(searchParams.agent, ["all", ...scopedFixtureOutlets.map((item) => item.agentName)], "all"),
    area: parseEnum(searchParams.area, ["all", ...scopedFixtureOutlets.map((item) => item.area)], "all"),
    time: parseEnum(searchParams.time, ["4h", "24h", "7d"], "24h"),
    risk: parseEnum(searchParams.risk, ["all", "low", "medium", "high"], "all"),
    freshness: parseEnum(searchParams.freshness, ["all", "fresh", "degraded", "stale"], "all"),
    page: parsePage(searchParams.page),
    view: parseEnum(searchParams.view, ["default", "loading", "empty", "error"], "default"),
  };
}

export function getOutletFilterOptions() {
  return {
    agents: [...new Set(scopedFixtureOutlets.map((item) => item.agentName))],
    areas: [...new Set(scopedFixtureOutlets.map((item) => item.area))],
  };
}

export async function getOutletOverview(filters: OutletFilters): Promise<OutletOverview> {
  const timeLimitHours = filters.time === "4h" ? 4 : filters.time === "24h" ? 24 : 168;
  const filtered = scopedFixtureOutlets
    .filter((item) => item.provider === currentProviderScope)
    .filter((item) => filters.provider === "all" || item.provider === filters.provider)
    .filter((item) => filters.agent === "all" || item.agentName === filters.agent)
    .filter((item) => filters.area === "all" || item.area === filters.area)
    .filter((item) => filters.risk === "all" || item.risk === filters.risk)
    .filter((item) => filters.freshness === "all" || item.freshness === filters.freshness)
    .filter((item) => item.lastActivityHours <= timeLimitHours)
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
      highAlerts: scopedFixtureOutlets.reduce((total, item) => total + item.highAlerts, 0),
      staleFeeds: scopedFixtureOutlets.filter((item) => item.freshness === "stale").length,
      openCases: scopedFixtureOutlets.reduce((total, item) => total + item.openCases, 0),
    },
    items: filtered.slice(start, start + PAGE_SIZE),
    total: filtered.length,
    pageCount,
  };
}
