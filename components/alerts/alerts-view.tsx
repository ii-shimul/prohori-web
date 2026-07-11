import Link from "next/link";

import { alertPresentation, severityClass } from "@/components/alerts/alert-presentation";

import { AlertFiltersBar } from "@/components/alerts/alert-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FreshnessBadge } from "@/components/shared/freshness-badge";
import { PageLoading } from "@/components/shared/page-loading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/formatters/dates";
import { getLocale, type Locale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/messages";
import { getAlerts, type AlertFilters, type OperationsAlert } from "@/lib/operations/alerts";


function AlertCard({ alert, detailBasePath, locale }: { alert: OperationsAlert; detailBasePath: "/alerts" | "/preview/operations/alerts"; locale: Locale }) {
  const presentation = alertPresentation[alert.type];
  const Icon = presentation.icon;
  const primaryEvidence = alert.evidence[0];

  return (
    <Card className="border border-border shadow-none transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2"><Icon aria-hidden="true" className="size-5 shrink-0 text-primary" /><CardTitle className="text-balance">{t(locale, `alerts.type.${alert.type}`)}</CardTitle></div>
            <CardDescription className="mt-2 text-pretty">{alert.outletName} · {alert.area} · {formatDateTime(alert.occurredAt)}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2"><Badge variant="outline" className={severityClass[alert.severity]}>{alert.severity}</Badge><FreshnessBadge freshness={alert.freshness} locale={locale} /></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-pretty text-sm leading-6">{t(locale, `alerts.summary.${alert.id}`)}</p>
        <dl className="grid gap-3 rounded-lg bg-muted p-3 text-sm sm:grid-cols-4">
          <div><dt className="text-xs text-muted-foreground">Detector</dt><dd className="mt-1 font-medium">{primaryEvidence.detector}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Baseline</dt><dd className="mt-1 font-mono tabular-nums">{primaryEvidence.baseline}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Observed</dt><dd className="mt-1 font-mono tabular-nums">{primaryEvidence.observed}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Threshold</dt><dd className="mt-1 font-mono tabular-nums">{primaryEvidence.threshold}</dd></div>
        </dl>
        <div className="flex flex-col gap-3 border-t border-border pt-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 text-muted-foreground">Owner: {alert.owner} · Case: {alert.linkedCase ?? "Not created"}</p>
          <Link className="shrink-0 font-medium text-primary hover:underline" href={`${detailBasePath}/${alert.id}`}>Review Evidence</Link>
        </div>
      </CardContent>
    </Card>
  );
}

export async function AlertsView({ filters, action }: { filters: AlertFilters; action: "/alerts" | "/preview/operations/alerts" }) {
  if (filters.view === "loading") return <PageLoading />;
  if (filters.view === "error") return <ErrorState description="Alerts could not load. Check API availability, then try again." correlationId="fixture-alerts-001" />;

  const [locale, alerts] = await Promise.all([
    getLocale(),
    getAlerts(
      filters.view === "empty" ? { ...filters, severity: "LOW", dataQuality: "critical" } : filters,
      action === "/preview/operations/alerts" ? "fixture" : "api",
    ),
  ]);

  return (
    <section aria-labelledby="alerts-title" className="mx-auto max-w-6xl space-y-6">
      <header className="border-b border-border pb-5">
        <p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">{t(locale, "alerts.queue")}</p>
        <h1 id="alerts-title" className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{t(locale, "alerts.title")}</h1>
        <p className="mt-2 max-w-3xl text-pretty text-muted-foreground">{t(locale, "alerts.description")}</p>
      </header>
      <AlertFiltersBar action={action} filters={filters} />
      {alerts.length === 0 ? <EmptyState title="No Alerts Match These Filters" description="Change one or more filters to review alerts in your authorized provider scope." /> : <div className="space-y-4">{alerts.map((alert) => <AlertCard key={alert.id} alert={alert} detailBasePath={action} locale={locale} />)}</div>}
    </section>
  );
}
