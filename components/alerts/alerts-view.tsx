"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleAlertIcon, Clock3Icon, CircleCheckIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FreshnessBadge } from "@/components/shared/freshness-badge";
import { PageLoading } from "@/components/shared/page-loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/formatters/dates";
import { t } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";

import { minimalApiRequest } from "@/lib/api/minimal-client";
import { alertPresentation, severityClass } from "@/components/alerts/alert-presentation";
import type { OperationsAlert, AlertFilters } from "@/lib/operations/alerts";
import { mapAlertSeverity, mapAlertStatus, mapFreshness } from "@/lib/operations/live-data";

export function AlertsView({ variant }: { variant: "alerts" | "preview" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [alerts, setAlerts] = useState<OperationsAlert[]>([]);
  const [locale, setLocale] = useState<Locale>("en");

  // Filters State
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDataQuality, setFilterDataQuality] = useState<string>("all");

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Read locale
      const match = document.cookie.match(/prohori_locale=(bn|en)/);
      const activeLocale = (match?.[1] || "en") as Locale;
      setLocale(activeLocale);

      const [alerts, providers, outlets, cases] = await Promise.all([
        minimalApiRequest<any[]>("alerts"),
        minimalApiRequest<any[]>("providers"),
        minimalApiRequest<any[]>("outlets"),
        minimalApiRequest<any[]>("cases").catch(() => []),
      ]);

      const rawAlerts = alerts;
      const rawProviders = providers;
      const rawOutlets = outlets;
      const rawCases = cases;

      const providerById = new Map(rawProviders.map((p) => [p.id, p.code]));
      const outletById = new Map(rawOutlets.map((o) => [o.id, o]));

      // Build mapping from alert ID to linked case ID
      const linkedCaseByAlertId = new Map<string, string>();
      rawCases.forEach((c: any) => {
        // Since cases can be linked to alerts (by database relationships)
        if (c.alertId) {
          linkedCaseByAlertId.set(c.alertId, c.id);
        }
      });

      const mappedAlerts: OperationsAlert[] = rawAlerts.map((alert: any) => {
        const providerCode = providerById.get(alert.providerId) || "PROVIDER_A";
        const outlet = outletById.get(alert.outletId);

        const type =
          alert.type === "provider_emoney_pressure" || alert.type === "shared_cash_pressure"
            ? "LIQUIDITY_PRESSURE"
            : alert.type === "unusual_activity_review"
            ? "UNUSUAL_ACTIVITY"
            : alert.type === "data_quality_issue"
            ? "DATA_INCONSISTENCY"
            : "COMBINED_REVIEW";

        const severity = mapAlertSeverity(alert.severity);

        const status = mapAlertStatus(alert.status);

        const freshness = mapFreshness(alert.dataQuality);
        const dataQuality = alert.dataQuality === "healthy" ? "good" : alert.dataQuality === "degraded" ? "degraded" : "critical";

        // Translate or fall back
        const summaryKey = alert.message?.key || `alerts.${alert.type}.review`;
        const nextStepKey = `alerts.next.${summaryKey}`;

        // Get evidence details
        const evidenceArray = alert.evidenceSnapshots
          ? alert.evidenceSnapshots.map((snapshot: any) => {
              const val = snapshot.snapshot || {};
              let observed = "See evidence record";
              if (val.score != null) observed = `Anomaly score: ${Number(val.score).toFixed(2)}`;
              else if (val.incidentCount != null) observed = `${val.incidentCount} active incident(s)`;
              else if (val.resource != null) observed = `Resource: ${String(val.resource).replace(/_/g, " ")}`;
              else if (val.forecastRunId != null) observed = "Forecast run recorded";

              return {
                detector: snapshot.kind === "forecast" ? "Liquidity forecast" : snapshot.kind === "anomaly_signal" ? "Unusual activity detector" : "Data quality check",
                baseline: "Within normal operating range",
                observed,
                threshold: "Review threshold exceeded",
                window: "Recorded observation window",
                explanation: val.statement || "Review the evidence record before deciding next action.",
              };
            })
          : [
              {
                detector: "System detector",
                baseline: "Within normal range",
                observed: "Threshold breached",
                threshold: "Review required",
                window: "Current window",
                explanation: "Review the evidence snapshot.",
              },
            ];

        return {
          id: alert.id,
          type,
          severity,
          status,
          provider: providerCode,
          outletId: alert.outletId,
          outletName: outlet?.name || `Outlet ${alert.outletId.slice(0, 8)}`,
          area: outlet?.area?.name || "Unknown Area",
          summary: t(activeLocale, summaryKey),
          summaryKey,
          nextStepKey,
          occurredAt: alert.lastObservedAt || alert.createdAt,
          freshness,
          dataQuality,
          modelConfidence: alert.modelConfidence || 0.8,
          safeNextStep: t(activeLocale, nextStepKey),
          recipient: `${providerCode.replace("_", " ")} Operations`,
          owner: alert.ownerUserId ? `User ${alert.ownerUserId.slice(0, 8)}` : "Unassigned",
          linkedCase: linkedCaseByAlertId.get(alert.id) || null,
          evidence: evidenceArray,
        };
      });

      setAlerts(mappedAlerts);
      setLoading(false);
    } catch (err: any) {
      console.error("Failed to load alerts", err);
      setError(err.message || "Failed to load alerts.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  if (loading) return <PageLoading />;
  if (error) return <ErrorState description={error} correlationId="alerts-load-error" />;

  const filteredAlerts = alerts
    .filter((a) => filterSeverity === "all" || a.severity === filterSeverity)
    .filter((a) => filterStatus === "all" || a.status === filterStatus)
    .filter((a) => filterType === "all" || a.type === filterType)
    .filter((a) => filterDataQuality === "all" || a.dataQuality === filterDataQuality);

  const selectClassName = "h-9 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  return (
    <section aria-labelledby="alerts-title" className="mx-auto max-w-6xl space-y-6">
      <header className="border-b border-border pb-5">
        <p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">{t(locale, "alerts.queue")}</p>
        <h1 id="alerts-title" className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{t(locale, "alerts.title")}</h1>
        <p className="mt-2 max-w-3xl text-pretty text-muted-foreground">{t(locale, "alerts.description")}</p>
      </header>

      {/* Filters Bar */}
      <div className="grid gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
        <label className="space-y-1.5 text-sm font-medium flex flex-col">
          Severity
          <select className={selectClassName} value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
            <option value="all">All Severities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-medium flex flex-col">
          Status
          <select className={selectClassName} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-medium flex flex-col">
          Alert Type
          <select className={selectClassName} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Alert Types</option>
            <option value="LIQUIDITY_PRESSURE">Liquidity Pressure</option>
            <option value="UNUSUAL_ACTIVITY">Unusual Activity</option>
            <option value="DATA_INCONSISTENCY">Data Inconsistency</option>
            <option value="COMBINED_REVIEW">Combined Review</option>
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-medium flex flex-col">
          Data Quality
          <select className={selectClassName} value={filterDataQuality} onChange={(e) => setFilterDataQuality(e.target.value)}>
            <option value="all">All Quality States</option>
            <option value="good">Good</option>
            <option value="degraded">Degraded</option>
            <option value="critical">Critical</option>
          </select>
        </label>
        <Button
          className="self-end cursor-pointer"
          onClick={() => {
            setFilterSeverity("all");
            setFilterStatus("all");
            setFilterType("all");
            setFilterDataQuality("all");
          }}
          type="button"
          variant="outline"
        >
          Clear
        </Button>
      </div>

      {filteredAlerts.length === 0 ? (
        <EmptyState title="No Alerts Match These Filters" description="Change one or more filters to review alerts in your authorized provider scope." />
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const presentation = alertPresentation[alert.type] || alertPresentation.COMBINED_REVIEW;
            const Icon = presentation.icon;
            const primaryEvidence = alert.evidence[0] || {
              detector: "System check",
              baseline: "—",
              observed: "—",
              threshold: "—",
            };

            return (
              <Card key={alert.id} className="border border-border shadow-none transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-sm">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon aria-hidden="true" className="size-5 shrink-0 text-primary" />
                        <CardTitle className="text-balance">{t(locale, `alerts.type.${alert.type}`)}</CardTitle>
                      </div>
                      <CardDescription className="mt-2 text-pretty">
                        {alert.outletName} · {alert.area} · {formatDateTime(alert.occurredAt)}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={severityClass[alert.severity]}>{alert.severity}</Badge>
                      <FreshnessBadge freshness={alert.freshness} locale={locale} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-pretty text-sm leading-6 font-medium">{t(locale, alert.summaryKey)}</p>
                  <dl className="grid gap-3 rounded-lg bg-muted p-3 text-sm sm:grid-cols-4">
                    <div>
                      <dt className="text-xs text-muted-foreground">Detector</dt>
                      <dd className="mt-1 font-medium">{primaryEvidence.detector}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Baseline</dt>
                      <dd className="mt-1 font-mono tabular-nums">{primaryEvidence.baseline}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Observed</dt>
                      <dd className="mt-1 font-mono tabular-nums">{primaryEvidence.observed}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Threshold</dt>
                      <dd className="mt-1 font-mono tabular-nums">{primaryEvidence.threshold}</dd>
                    </div>
                  </dl>
                  <div className="flex flex-col gap-3 border-t border-border pt-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <p className="min-w-0 text-muted-foreground">
                      Owner: {alert.owner} · Case: {alert.linkedCase ? `CASE-${alert.linkedCase.slice(0,8)}` : "Not created"}
                    </p>
                    <Link className="shrink-0 font-medium text-primary hover:underline" href={`/alerts/${alert.id}`}>
                      Review Evidence
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
