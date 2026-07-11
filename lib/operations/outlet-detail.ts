import type { Freshness } from "@/lib/formatters/status";
import type { Provider, RiskLevel } from "@/types/domain";

export type DataQuality = "good" | "degraded" | "critical";

export type OutletTransaction = {
  id: string;
  occurredAt: string;
  type: "CASH_IN" | "CASH_OUT";
  provider: Provider;
  amountMinor: string;
  status: "SETTLED" | "PENDING";
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
  agentName: string;
  provider: Provider;
  freshness: Freshness;
  dataQuality: DataQuality;
  updatedAt: string;
  sharedCashMinor: string;
  providerEfloatMinor: string;
  limitingResource: "Provider A e-money" | "Shared physical cash";
  risk: RiskLevel;
  thresholdEtaMinutes: number | null;
  confidence: number;
  safeNextStep: string;
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

export async function getOutletDetail(outletId: string): Promise<OutletDetail | null> {
  return fixtureOutletDetails[outletId] ?? null;
}
