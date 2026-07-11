"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { alertPresentation, qualityClass, severityClass } from "@/components/alerts/alert-presentation";
import { AlertActionsClient } from "@/components/alerts/alert-actions-client";
import { FreshnessBadge } from "@/components/shared/freshness-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/formatters/dates";
import { t } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import type { OperationsAlert } from "@/lib/operations/alerts";
import { minimalApiRequest } from "@/lib/api/minimal-client";

export function AlertDetailView({
  alertId,
  backHref,
  outletHref,
  caseHref,
}: {
  alertId: string;
  backHref: string;
  outletHref: string;
  caseHref?: string;
}) {
  const [locale, setLocale] = useState<Locale>("en");
  const [alert, setAlert] = useState<OperationsAlert | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Read locale
    const match = document.cookie.match(/prohori_locale=(bn|en)/);
    if (match?.[1]) {
      setLocale(match[1] as Locale);
    }

    async function loadAlert() {
      try {
        const [rawAlert, rawProviders, rawOutlets, rawCases] = await Promise.all([
          minimalApiRequest<any>(`alerts/${alertId}`),
          minimalApiRequest<any[]>("providers"),
          minimalApiRequest<any[]>("outlets"),
          minimalApiRequest<any[]>("cases").catch(() => []),
        ]);

        const providerCode = rawProviders.find((p) => p.id === rawAlert.providerId)?.code || "PROVIDER_A";
        const outlet = rawOutlets.find((o) => o.id === rawAlert.outletId);

        const type =
          rawAlert.type === "provider_emoney_pressure" || rawAlert.type === "shared_cash_pressure"
            ? "LIQUIDITY_PRESSURE"
            : rawAlert.type === "unusual_activity_review"
            ? "UNUSUAL_ACTIVITY"
            : rawAlert.type === "data_quality_issue"
            ? "DATA_INCONSISTENCY"
            : "COMBINED_REVIEW";

        const severity =
          rawAlert.severity === "low" ? "LOW" : rawAlert.severity === "moderate" ? "MEDIUM" : "HIGH";

        const status =
          rawAlert.status === "open"
            ? "active"
            : rawAlert.status === "acknowledged"
            ? "acknowledged"
            : rawAlert.status === "assigned" || rawAlert.status === "case_created"
            ? "escalated"
            : "resolved";

        const freshness = rawAlert.dataQuality === "healthy" ? "fresh" : rawAlert.dataQuality === "degraded" ? "degraded" : "stale";
        const dataQuality = rawAlert.dataQuality === "healthy" ? "good" : rawAlert.dataQuality === "degraded" ? "degraded" : "critical";

        const summaryKey = rawAlert.message?.key || `alerts.${rawAlert.type}.review`;
        const nextStepKey = `alerts.next.${summaryKey}`;

        // Build mapping from alert ID to linked case ID
        const linkedCase = rawCases.find((c: any) => c.alertId === rawAlert.id)?.id || null;

        const evidenceArray = rawAlert.evidenceSnapshots
          ? rawAlert.evidenceSnapshots.map((snapshot: any) => {
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
                detector: "System check",
                baseline: "Within normal range",
                observed: "Breached",
                threshold: "Review required",
                window: "Current window",
                explanation: "Review the evidence record.",
              },
            ];

        setAlert({
          id: rawAlert.id,
          type,
          severity,
          status,
          provider: providerCode,
          outletId: rawAlert.outletId,
          outletName: outlet?.name || `Outlet ${rawAlert.outletId.slice(0, 8)}`,
          area: outlet?.area?.name || "Unknown Area",
          summary: t(locale, summaryKey),
          summaryKey,
          nextStepKey,
          occurredAt: rawAlert.lastObservedAt || rawAlert.createdAt,
          freshness,
          dataQuality,
          modelConfidence: rawAlert.modelConfidence || 0.8,
          safeNextStep: t(locale, nextStepKey),
          recipient: `${providerCode.replace("_", " ")} Operations`,
          owner: rawAlert.ownerUserId ? `User ${rawAlert.ownerUserId.slice(0, 8)}` : "Unassigned",
          linkedCase,
          evidence: evidenceArray,
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }

    loadAlert();
  }, [alertId, refreshTrigger]);

  if (loading) return <PageLoading />;
  if (!alert) return <div className="p-8 text-center text-destructive">Alert not found or access denied.</div>;

  const presentation = alertPresentation[alert.type] || alertPresentation.COMBINED_REVIEW;
  const Icon = presentation.icon;

  return (
    <section aria-labelledby="alert-title" className="mx-auto max-w-6xl space-y-6">
      <header className="border-b border-border pb-5">
        <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeftIcon aria-hidden="true" className="size-4" />
          {t(locale, "alerts.back")}
        </Link>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">{t(locale, "alerts.detail")}</p>
            <div className="mt-2 flex items-start gap-3">
              <Icon aria-hidden="true" className="mt-1 size-6 shrink-0 text-primary" />
              <h1 id="alert-title" className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                {t(locale, `alerts.type.${alert.type}`)}
              </h1>
            </div>
            <p className="mt-3 max-w-3xl text-pretty text-muted-foreground">{t(locale, alert.summaryKey)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={severityClass[alert.severity]}>{alert.severity}</Badge>
            <FreshnessBadge freshness={alert.freshness} locale={locale} />
            <Badge variant="outline" className={qualityClass[alert.dataQuality]}>{t(locale, "alerts.dataQuality")}: {alert.dataQuality}</Badge>
          </div>
        </div>
      </header>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <Card className="border border-border shadow-none">
            <CardHeader>
              <CardTitle>{t(locale, "alerts.evidence")}</CardTitle>
              <CardDescription>Observed values compare against stored baseline and threshold.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {alert.evidence.map((evidence, idx) => (
                <article key={idx} className="rounded-lg border border-border p-4">
                  <h2 className="font-semibold">{evidence.detector}</h2>
                  <dl className="mt-3 grid gap-3 sm:grid-cols-4">
                    <div>
                      <dt className="text-xs text-muted-foreground">Baseline</dt>
                      <dd className="mt-1 font-mono text-sm tabular-nums">{evidence.baseline}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Observed</dt>
                      <dd className="mt-1 font-mono text-sm tabular-nums">{evidence.observed}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Threshold</dt>
                      <dd className="mt-1 font-mono text-sm tabular-nums">{evidence.threshold}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Window</dt>
                      <dd className="mt-1 text-sm">{evidence.window}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-sm text-muted-foreground">Possible normal explanation: {evidence.explanation}</p>
                </article>
              ))}
            </CardContent>
          </Card>
          {alert.type === "COMBINED_REVIEW" && (
            <Card className="border border-cta-gold/60 bg-cta-gold/10 shadow-none">
              <CardContent className="pt-4 text-sm text-primary">
                Underlying signals require separate review. Their timing does not establish a causal connection.
              </CardContent>
            </Card>
          )}
        </div>
        <aside className="space-y-4">
          <AlertActionsClient
            alertId={alert.id}
            status={alert.status}
            owner={alert.owner}
            hasLinkedCase={!!alert.linkedCase}
            onWorkflowComplete={() => setRefreshTrigger((prev) => prev + 1)}
          />
          <Card className="border border-border shadow-none">
            <CardHeader>
              <CardTitle>Review Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Outlet</p>
                <Link className="font-medium text-primary hover:underline" href={`/outlets/${alert.outletId}`}>{alert.outletName}</Link>
              </div>
              <div>
                <p className="text-muted-foreground">Recipient</p>
                <p className="font-medium">{alert.recipient}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Owner</p>
                <p className="font-medium">{alert.owner}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Linked Case</p>
                {alert.linkedCase ? (
                  <Link className="font-medium text-primary hover:underline" href={`/cases/${alert.linkedCase}`}>
                    {`CASE-${alert.linkedCase.slice(0, 8)}`}
                  </Link>
                ) : (
                  <p className="font-medium">Not created</p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground">Raised</p>
                <p>{formatDateTime(alert.occurredAt)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-none">
            <CardHeader>
              <CardTitle>{t(locale, "alerts.safeNextStep")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{t(locale, alert.nextStepKey)}</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}
