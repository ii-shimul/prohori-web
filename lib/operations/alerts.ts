import type { components } from "@/lib/api/generated";

import type { AlertType, Provider, Severity } from "@/types/domain";

export type AlertStatus = "active" | "acknowledged" | "escalated" | "resolved" | "closed";
export type AlertDataQuality = "good" | "degraded" | "critical";

export type AlertEvidence = {
  detector: string;
  baseline: string;
  observed: string;
  threshold: string;
  window: string;
  explanation: string;
};

export type OperationsAlert = {
  id: string;
  type: AlertType;
  severity: Severity;
  status: AlertStatus;
  provider: Provider;
  outletId: string;
  outletName: string;
  area: string;
  summary: string;
  summaryKey: string;
  nextStepKey: string;
  occurredAt: string;
  freshness: "fresh" | "degraded" | "stale";
  dataQuality: AlertDataQuality;
  modelConfidence: number;
  safeNextStep: string;
  recipient: string;
  owner: string;
  linkedCase: string | null;
  evidence: AlertEvidence[];
};

type ApiAlert = components["schemas"]["Alert"];
type ApiAlertDetail = components["schemas"]["AlertDetail"];
type ApiProvider = components["schemas"]["Provider"];
type ApiOutlet = components["schemas"]["Outlet"];
type AlertSource = "fixture" | "api";

export type AlertFilters = {
  severity: Severity | "all";
  status: AlertStatus | "all";
  type: AlertType | "all";
  dataQuality: AlertDataQuality | "all";
  view: "default" | "loading" | "empty" | "error";
};

const currentProviderScope: Provider = "PROVIDER_A";

const fixtureAlerts: readonly OperationsAlert[] = [
  {
    id: "alert-b-liquidity",
    type: "LIQUIDITY_PRESSURE",
    severity: "HIGH",
    status: "active",
    provider: "PROVIDER_A",
    outletId: "dha-017",
    outletName: "Dhanmondi 27 Agent Point",
    area: "Dhaka North",
    summary: "Provider A e-money may cross its reserve threshold within 38 minutes.",
    summaryKey: "alerts.summary.alert-b-liquidity",
    nextStepKey: "alerts.next.alert-b-liquidity",
    occurredAt: "2026-07-11T09:32:00.000Z",
    freshness: "fresh",
    dataQuality: "good",
    modelConfidence: 0.86,
    safeNextStep: "Verify demand context and contact authorized operations.",
    recipient: "Provider A Operations",
    owner: "Unassigned",
    linkedCase: "CASE-204",
    evidence: [
      { detector: "Reserve threshold forecast", baseline: "৳2,900", observed: "৳1,950", threshold: "৳1,000", window: "Next 4 hours", explanation: "Demand may normalize after current peak period." },
    ],
  },
  {
    id: "alert-b-activity",
    type: "UNUSUAL_ACTIVITY",
    severity: "HIGH",
    status: "active",
    provider: "PROVIDER_A",
    outletId: "dha-017",
    outletName: "Dhanmondi 27 Agent Point",
    area: "Dhaka North",
    summary: "Repeated cash-out amounts exceed normal outlet activity and require review.",
    summaryKey: "alerts.summary.alert-b-activity",
    nextStepKey: "alerts.next.alert-b-activity",
    occurredAt: "2026-07-11T09:29:00.000Z",
    freshness: "fresh",
    dataQuality: "good",
    modelConfidence: 0.81,
    safeNextStep: "Verify transaction context before taking any operational action.",
    recipient: "Provider A Operations",
    owner: "Unassigned",
    linkedCase: "CASE-204",
    evidence: [
      { detector: "Repeated identical amounts", baseline: "1 occurrence", observed: "4 occurrences", threshold: "3 occurrences", window: "15 minutes", explanation: "A local event or routine bulk service may explain a temporary concentration." },
      { detector: "Transaction velocity", baseline: "5 cash-outs", observed: "16 cash-outs", threshold: "12 cash-outs", window: "15 minutes", explanation: "Demand surge may be normal during a local peak period." },
    ],
  },
  {
    id: "alert-b-review",
    type: "COMBINED_REVIEW",
    severity: "HIGH",
    status: "acknowledged",
    provider: "PROVIDER_A",
    outletId: "dha-017",
    outletName: "Dhanmondi 27 Agent Point",
    area: "Dhaka North",
    summary: "Liquidity pressure and unusual activity are both present. Review underlying signals separately.",
    summaryKey: "alerts.summary.alert-b-review",
    nextStepKey: "alerts.next.alert-b-review",
    occurredAt: "2026-07-11T09:33:00.000Z",
    freshness: "fresh",
    dataQuality: "good",
    modelConfidence: 0.78,
    safeNextStep: "Verify each signal independently and contact authorized operations.",
    recipient: "Provider A Operations",
    owner: "M. Rahman",
    linkedCase: "CASE-204",
    evidence: [
      { detector: "Combined review rule", baseline: "No combined review", observed: "2 review signals", threshold: "2 signals", window: "15 minutes", explanation: "Signals are correlated in time only; correlation does not establish cause." },
    ],
  },
  {
    id: "alert-c-inconsistency",
    type: "DATA_INCONSISTENCY",
    severity: "MEDIUM",
    status: "active",
    provider: "PROVIDER_A",
    outletId: "ban-008",
    outletName: "Banani Lake Road Counter",
    area: "Dhaka North",
    summary: "Conflicting balance snapshot and delayed feed require data verification before forecast use.",
    summaryKey: "alerts.summary.alert-c-inconsistency",
    nextStepKey: "alerts.next.alert-c-inconsistency",
    occurredAt: "2026-07-11T09:34:00.000Z",
    freshness: "stale",
    dataQuality: "critical",
    modelConfidence: 0.43,
    safeNextStep: "Verify data. Do not rely on an exact forecast until feed consistency is restored.",
    recipient: "Provider A Operations",
    owner: "Data Quality Desk",
    linkedCase: null,
    evidence: [
      { detector: "Balance reconciliation", baseline: "Last accepted snapshot", observed: "Conflicting snapshot", threshold: "Exact match required", window: "6 hours", explanation: "Delayed or out-of-order provider feed may explain the mismatch." },
      { detector: "Feed freshness", baseline: "Under 15 minutes", observed: "6 hours 15 minutes", threshold: "30 minutes", window: "Current feed", explanation: "Provider feed may be delayed; verify source availability." },
    ],
  },
];

function parseEnum<T extends string>(value: string | string[] | undefined, allowed: readonly T[], fallback: T): T {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && allowed.includes(candidate as T) ? (candidate as T) : fallback;
}

export function parseAlertFilters(searchParams: Record<string, string | string[] | undefined>): AlertFilters {
  return {
    severity: parseEnum(searchParams.severity, ["all", "LOW", "MEDIUM", "HIGH"], "all"),
    status: parseEnum(searchParams.status, ["all", "active", "acknowledged", "escalated", "resolved", "closed"], "all"),
    type: parseEnum(searchParams.type, ["all", "LIQUIDITY_PRESSURE", "UNUSUAL_ACTIVITY", "DATA_INCONSISTENCY", "COMBINED_REVIEW"], "all"),
    dataQuality: parseEnum(searchParams.dataQuality, ["all", "good", "degraded", "critical"], "all"),
    view: parseEnum(searchParams.view, ["default", "loading", "empty", "error"], "default"),
  };
}

export async function getAlerts(filters: AlertFilters, source: AlertSource = "fixture"): Promise<OperationsAlert[]> {
  if (source === "api") {
    const { apiRequest } = await import("@/lib/api/client");
    const accessToken = await requireAccessToken();
    const [alerts, providers, outlets] = await Promise.all([
      apiRequest<readonly ApiAlert[]>("alerts", accessToken, {
        query: alertQuery(filters),
      }),
      apiRequest<readonly ApiProvider[]>("providers", accessToken),
      apiRequest<readonly ApiOutlet[]>("outlets", accessToken),
    ]);
    return alerts
      .map((alert) => toOperationsAlert(alert, providers, outlets))
      .filter((alert) => filters.severity === "all" || alert.severity === filters.severity)
      .filter((alert) => filters.status === "all" || alert.status === filters.status)
      .filter((alert) => filters.type === "all" || alert.type === filters.type)
      .filter((alert) => filters.dataQuality === "all" || alert.dataQuality === filters.dataQuality)
      .toSorted((left, right) => right.occurredAt.localeCompare(left.occurredAt));
  }

  return fixtureAlerts
    .filter((alert) => alert.provider === currentProviderScope)
    .filter((alert) => filters.severity === "all" || alert.severity === filters.severity)
    .filter((alert) => filters.status === "all" || alert.status === filters.status)
    .filter((alert) => filters.type === "all" || alert.type === filters.type)
    .filter((alert) => filters.dataQuality === "all" || alert.dataQuality === filters.dataQuality)
    .toSorted((left, right) => right.occurredAt.localeCompare(left.occurredAt));
}

export async function getAlert(alertId: string, source: AlertSource = "fixture"): Promise<OperationsAlert | null> {
  if (source === "api") {
    const { apiRequest } = await import("@/lib/api/client");
    const accessToken = await requireAccessToken();
    try {
      const [alert, providers, outlets] = await Promise.all([
        apiRequest<ApiAlertDetail>(`alerts/${encodeURIComponent(alertId)}`, accessToken),
        apiRequest<readonly ApiProvider[]>("providers", accessToken),
        apiRequest<readonly ApiOutlet[]>("outlets", accessToken),
      ]);
      const operationsAlert = toOperationsAlert(alert, providers, outlets);
      
      try {
        const cases = await apiRequest<readonly components["schemas"]["Case"][]>("cases", accessToken, {
          query: { outletId: alert.outletId },
        });
        if (cases && cases.length > 0) {
          const timelines = await Promise.all(
            cases.map((c) =>
              apiRequest<components["schemas"]["CaseTimeline"]>(`cases/${encodeURIComponent(c.id)}/timeline`, accessToken).then(
                (timeline) => ({ caseId: c.id, timeline })
              ).catch(() => null)
            )
          );
          for (const item of timelines) {
            if (!item) continue;
            const hasAlert = item.timeline.events.some((event) => {
              if (event && typeof event === "object" && "metadata" in event) {
                const metadata = event.metadata as Record<string, unknown>;
                return metadata && metadata.alertId === alertId;
              }
              return false;
            });
            if (hasAlert) {
              operationsAlert.linkedCase = item.caseId;
              break;
            }
          }
        }
      } catch (e) {
        // Silently swallow errors fetching cases/timelines
      }
      
      return operationsAlert;
    } catch (error) {
      if (error instanceof Error && "status" in error && error.status === 404) return null;
      throw error;
    }
  }

  const alert = fixtureAlerts.find((item) => item.id === alertId && item.provider === currentProviderScope);
  return alert ?? null;
}
function alertQuery(filters: AlertFilters): Record<string, string | boolean> {
  const query: Record<string, string | boolean> = {};
  if (filters.status !== "all") query.active = filters.status === "active";
  if (filters.type !== "all") query.type = toApiAlertType(filters.type);
  return query;
}

async function requireAccessToken(): Promise<string> {
  const { getVerifiedAccessToken } = await import("@/lib/auth/session");
  const token = await getVerifiedAccessToken();
  if (!token) throw new Error("Authenticated API read requires a verified Supabase access token.");
  return token;
}

const MESSAGE_SUMMARY: Record<string, string> = {
  "alerts.provider_emoney_pressure.review": "Provider e-money may cross its reserve threshold. Verify demand context before escalating.",
  "alerts.shared_cash_pressure.review": "Shared physical cash may cross its reserve threshold. Verify demand context before escalating.",
  "alerts.unusual_activity_review.review": "Transaction pattern requires review. Verify context before taking any operational action.",
  "alerts.data_quality_issue.review": "Data inconsistency or stale feed detected. Verify data before relying on forecast output.",
  "alerts.combined_review.review": "Multiple signals present. Review each signal independently — correlation does not establish cause.",
};

const MESSAGE_NEXT_STEP: Record<string, string> = {
  "alerts.provider_emoney_pressure.review": "Verify demand context and contact authorized operations if pressure persists.",
  "alerts.shared_cash_pressure.review": "Verify demand context and contact authorized operations if pressure persists.",
  "alerts.unusual_activity_review.review": "Verify transaction context before taking any operational action.",
  "alerts.data_quality_issue.review": "Do not rely on an exact forecast until feed consistency is restored.",
  "alerts.combined_review.review": "Verify each signal independently and contact authorized operations.",
};

function toOperationsAlert(alert: ApiAlert | ApiAlertDetail, providers: readonly ApiProvider[], outlets: readonly ApiOutlet[]): OperationsAlert {
  const provider = providers.find((item) => item.id === alert.providerId)?.code ?? currentProviderScope;
  const outlet = outlets.find((item) => item.id === alert.outletId);
  const type = toUiAlertType(alert.type);
  const summary = MESSAGE_SUMMARY[alert.message.key] ?? `Review required — ${alert.type.replace(/_/g, " ")}.`;
  const safeNextStep = MESSAGE_NEXT_STEP[alert.message.key] ?? "Verify context before taking any operational action.";
  const evidence = "evidenceSnapshots" in alert
    ? alert.evidenceSnapshots.map((snapshot) => toEvidence(snapshot.snapshot, snapshot.kind))
    : [toEvidence(alert.evidence, alert.message.key)];

  return {
    id: alert.id,
    type,
    severity: toUiSeverity(alert.severity),
    status: toUiStatus(alert.status),
    provider,
    outletId: alert.outletId,
    outletName: outlet?.name ?? `Outlet ${alert.outletId}`,
    area: outlet?.area.name ?? "Authorized area",
    summary,
    summaryKey: alert.message.key,
    nextStepKey: `alerts.next.${alert.message.key}`,
    occurredAt: alert.lastObservedAt,
    freshness: toFreshness(alert.dataQuality),
    dataQuality: toDataQuality(alert.dataQuality),
    modelConfidence: alert.modelConfidence,
    safeNextStep,
    recipient: `${provider} Operations`,
    owner: alert.ownerUserId ? `User ${alert.ownerUserId.slice(0, 8)}…` : "Unassigned",
    linkedCase: null,
    evidence,
  };
}

function evidenceKindLabel(kind: string): string {
  if (kind === "forecast") return "Liquidity forecast";
  if (kind === "anomaly_signal") return "Unusual activity detector";
  if (kind === "data_quality_incident") return "Data quality check";
  if (kind === "correlation") return "Combined signal correlation";
  return kind.replace(/_/g, " ");
}

function toEvidence(value: Record<string, unknown>, kind: string): AlertEvidence {
  let observed = "See evidence record";
  if (value.score != null) observed = `Anomaly score: ${Number(value.score).toFixed(2)}`;
  else if (value.incidentCount != null) observed = `${value.incidentCount} active incident(s)`;
  else if (value.resource != null) observed = `Resource: ${String(value.resource).replace(/_/g, " ")}`;
  else if (value.forecastRunId != null) observed = "Forecast run recorded — reserve threshold at risk";

  const explanation =
    typeof value.statement === "string"
      ? value.statement
      : "Review the evidence record before deciding the next action.";

  return {
    detector: evidenceKindLabel(kind),
    baseline: "Within normal operating range",
    observed,
    threshold: "Review threshold exceeded",
    window: "Recorded observation window",
    explanation,
  };
}

function toApiAlertType(type: AlertType): components["schemas"]["AlertType"] {
  return type === "LIQUIDITY_PRESSURE" ? "provider_emoney_pressure" : type === "UNUSUAL_ACTIVITY" ? "unusual_activity_review" : type === "DATA_INCONSISTENCY" ? "data_quality_issue" : "combined_review";
}

function toUiAlertType(type: components["schemas"]["AlertType"]): AlertType {
  return type === "provider_emoney_pressure" || type === "shared_cash_pressure" ? "LIQUIDITY_PRESSURE" : type === "unusual_activity_review" ? "UNUSUAL_ACTIVITY" : type === "data_quality_issue" ? "DATA_INCONSISTENCY" : "COMBINED_REVIEW";
}

function toUiSeverity(severity: ApiAlert["severity"]): Severity {
  return severity === "low" ? "LOW" : severity === "moderate" ? "MEDIUM" : "HIGH";
}

function toUiStatus(status: ApiAlert["status"]): AlertStatus {
  return status === "open" ? "active" : status === "acknowledged" ? "acknowledged" : status === "assigned" || status === "case_created" ? "escalated" : "resolved";
}

function toFreshness(quality: ApiAlert["dataQuality"]): OperationsAlert["freshness"] {
  return quality === "healthy" ? "fresh" : quality === "degraded" ? "degraded" : "stale";
}

function toDataQuality(quality: ApiAlert["dataQuality"]): AlertDataQuality {
  return quality === "healthy" ? "good" : quality === "degraded" ? "degraded" : "critical";
}
