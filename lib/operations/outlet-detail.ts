import type { components } from "@/lib/api/generated";
import type { Freshness } from "@/lib/formatters/status";
import type { Provider, RiskLevel } from "@/types/domain";

export type DataQuality = "good" | "degraded" | "critical";

export type OutletTransaction = {
  id: string;
  occurredAt: string;
  type: "CASH_IN" | "CASH_OUT";
  provider: Provider;
  amountMinor: string;
  status: "PENDING" | "SETTLED" | "FAILED" | "REVERSED";
};

export type ForecastHorizon = {
  label: "30 min" | "1 hour" | "2 hours" | "4 hours";
  lowMinor: string;
  expectedMinor: string;
  highMinor: string;
};

export type OutletDetail = {
  id: string;
  outletName: string;
  area: string;
  agentName: string | null;
  provider: Provider | "SHARED";
  freshness: Freshness;
  dataQuality: DataQuality;
  updatedAt: string;
  sharedCashMinor: string | null;
  providerEfloatMinor: string | null;
  limitingResource: string;
  risk: RiskLevel;
  thresholdEtaMinutes: number | null;
  confidence: number;
  safeNextStep: string | null;
  forecast: ForecastHorizon[] | null;
  transactions: OutletTransaction[];
};

const fixtureOutletDetails: Readonly<Record<string, OutletDetail>> = {
  "dha-017": {
    id: "dha-017",
    outletName: "Dhanmondi 27 Agent Point",
    area: "Dhaka North",
    agentName: "Nusrat Jahan",
    provider: "PROVIDER_A",
    freshness: "fresh",
    dataQuality: "good",
    updatedAt: "2026-07-11T09:32:00.000Z",
    sharedCashMinor: "440000",
    providerEfloatMinor: "195000",
    limitingResource: "Provider A e-money",
    risk: "high",
    thresholdEtaMinutes: 38,
    confidence: 0.86,
    safeNextStep: "Verify demand context and contact authorized operations.",
    forecast: [
      { label: "30 min", lowMinor: "165000", expectedMinor: "180000", highMinor: "195000" },
      { label: "1 hour", lowMinor: "125000", expectedMinor: "155000", highMinor: "185000" },
      { label: "2 hours", lowMinor: "75000", expectedMinor: "110000", highMinor: "145000" },
      { label: "4 hours", lowMinor: "10000", expectedMinor: "55000", highMinor: "100000" },
    ],
    transactions: [
      { id: "txn-a-1047", occurredAt: "2026-07-11T09:24:00.000Z", type: "CASH_OUT", provider: "PROVIDER_A", amountMinor: "25000", status: "SETTLED" },
      { id: "txn-a-1046", occurredAt: "2026-07-11T09:18:00.000Z", type: "CASH_OUT", provider: "PROVIDER_A", amountMinor: "30000", status: "SETTLED" },
      { id: "txn-a-1045", occurredAt: "2026-07-11T09:05:00.000Z", type: "CASH_IN", provider: "PROVIDER_A", amountMinor: "18000", status: "SETTLED" },
      { id: "txn-a-1044", occurredAt: "2026-07-11T08:52:00.000Z", type: "CASH_OUT", provider: "PROVIDER_A", amountMinor: "25000", status: "PENDING" },
    ],
  },
  "ban-008": {
    id: "ban-008",
    outletName: "Banani Lake Road Counter",
    area: "Dhaka North",
    agentName: "Tanvir Hasan",
    provider: "PROVIDER_A",
    freshness: "stale",
    dataQuality: "critical",
    updatedAt: "2026-07-11T03:19:00.000Z",
    sharedCashMinor: "650000",
    providerEfloatMinor: "440000",
    limitingResource: "Shared physical cash",
    risk: "medium",
    thresholdEtaMinutes: null,
    confidence: 0.43,
    safeNextStep: "Verify data before relying on any forecast or escalating the case.",
    forecast: null,
    transactions: [
      { id: "txn-a-0838", occurredAt: "2026-07-11T03:19:00.000Z", type: "CASH_OUT", provider: "PROVIDER_A", amountMinor: "15000", status: "SETTLED" },
      { id: "txn-a-0837", occurredAt: "2026-07-11T03:03:00.000Z", type: "CASH_IN", provider: "PROVIDER_A", amountMinor: "22000", status: "SETTLED" },
      { id: "txn-a-0836", occurredAt: "2026-07-11T02:46:00.000Z", type: "CASH_OUT", provider: "PROVIDER_A", amountMinor: "15000", status: "SETTLED" },
    ],
  },
};

type OutletDetailSource = "fixture" | "api";
type ApiOutlet = components["schemas"]["Outlet"];
type ApiProvider = components["schemas"]["Provider"];
type ApiHealth = components["schemas"]["OutletHealth"];
type ApiBalances = components["schemas"]["OutletBalances"];
type ApiForecastRun = components["schemas"]["ForecastRun"];
type ApiQuality = components["schemas"]["OutletDataQuality"];
type ApiTransactions = components["schemas"]["TransactionPage"];

export async function getOutletDetail(outletId: string, source: OutletDetailSource = "fixture"): Promise<OutletDetail | null> {
  if (source === "api") {
    const [{ apiRequest }, { getVerifiedAccessToken }] = await Promise.all([
      import("@/lib/api/client"),
      import("@/lib/auth/session"),
    ]);
    const accessToken = await getVerifiedAccessToken();
    if (!accessToken) throw new Error("Authenticated API read requires a verified Supabase access token.");

    try {
      const [outletList, providers, health, balances, forecasts, quality, transactions] = await Promise.all([
        apiRequest<readonly ApiOutlet[]>("outlets", accessToken),
        apiRequest<readonly ApiProvider[]>("providers", accessToken),
        apiRequest<ApiHealth>(`outlets/${encodeURIComponent(outletId)}/health`, accessToken),
        apiRequest<ApiBalances>(`outlets/${encodeURIComponent(outletId)}/balances`, accessToken),
        apiRequest<ApiForecastRun>(`outlets/${encodeURIComponent(outletId)}/forecasts`, accessToken),
        apiRequest<ApiQuality>(`outlets/${encodeURIComponent(outletId)}/data-quality`, accessToken),
        apiRequest<ApiTransactions>(`outlets/${encodeURIComponent(outletId)}/transactions`, accessToken),
      ]);
      const outlet = outletList.find((item) => item.id === outletId);
      if (!outlet) return null;
      return toOutletDetail(outlet, providers, health, balances, forecasts, quality, transactions);
    } catch (error) {
      if (error instanceof Error && "status" in error && error.status === 404) return null;
      throw error;
    }
  }

  return fixtureOutletDetails[outletId] ?? null;
}

function toOutletDetail(
  outlet: ApiOutlet,
  providers: readonly ApiProvider[],
  health: ApiHealth,
  balances: ApiBalances,
  forecasts: ApiForecastRun,
  quality: ApiQuality,
  transactions: ApiTransactions,
): OutletDetail {
  const providerById = new Map(providers.map((provider) => [provider.id, provider.code]));
  const limiting = health.limitingResource;
  const provider = limiting?.providerId ? providerById.get(limiting.providerId) ?? "SHARED" : "SHARED";
  const resource = forecasts.resources.find((item) => item.resource === limiting?.resource && item.providerId === limiting?.providerId) ?? forecasts.resources[0];
  const lastPoint = resource?.points.at(-1);

  return {
    id: outlet.id,
    outletName: outlet.name,
    area: outlet.area.name,
    agentName: null,
    provider,
    freshness: toFreshness(quality.dataQuality),
    dataQuality: toDataQuality(quality.dataQuality),
    updatedAt: forecasts.generatedAt,
    sharedCashMinor: balances.sharedCash.amountMinor,
    providerEfloatMinor: balances.providerEMoney.find((item) => item.provider.code === provider)?.amountMinor ?? null,
    limitingResource: limiting?.resource === "provider_efloat" ? `${provider} e-money` : limiting?.resource === "shared_cash" ? "Shared physical cash" : "Not provided by API",
    risk: toRisk(lastPoint?.riskBand),
    thresholdEtaMinutes: lastPoint?.reserveEtaMinutes ?? null,
    confidence: health.modelConfidence,
    safeNextStep: null,
    forecast: resource?.points.map((point) => ({
      label: point.horizonMinutes === 30 ? "30 min" : point.horizonMinutes === 60 ? "1 hour" : point.horizonMinutes === 120 ? "2 hours" : "4 hours",
      lowMinor: point.projectedLowMinor,
      expectedMinor: point.projectedMidMinor,
      highMinor: point.projectedHighMinor,
    })) ?? null,
    transactions: transactions.items.map((transaction) => ({
      id: transaction.id,
      occurredAt: transaction.occurredAt,
      type: transaction.type,
      provider: transaction.provider.code,
      amountMinor: transaction.amountMinor,
      status: transaction.lifecycle,
    })),
  };
}

function toFreshness(value: ApiQuality["dataQuality"]): Freshness {
  return value === "healthy" ? "fresh" : value === "degraded" ? "degraded" : "stale";
}

function toDataQuality(value: ApiQuality["dataQuality"]): DataQuality {
  return value === "healthy" ? "good" : value === "degraded" ? "degraded" : "critical";
}

function toRisk(value: ApiForecastRun["resources"][number]["points"][number]["riskBand"] | undefined): RiskLevel {
  return value === "high" || value === "critical" ? "high" : value === "moderate" ? "medium" : "low";
}
