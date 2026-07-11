import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { alertPresentation, qualityClass, severityClass } from "@/components/alerts/alerts-view";
import { FreshnessBadge } from "@/components/shared/freshness-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/formatters/dates";
import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/messages";
import type { OperationsAlert } from "@/lib/operations/alerts";

export async function AlertDetailView({ alert, backHref, outletHref, caseHref }: { alert: OperationsAlert; backHref: string; outletHref: string; caseHref?: string }) {
  const locale = await getLocale();
  const presentation = alertPresentation[alert.type];
  const Icon = presentation.icon;

  return (
    <section aria-labelledby="alert-title" className="mx-auto max-w-6xl space-y-6">
      <header className="border-b border-border pb-5">
        <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><ArrowLeftIcon aria-hidden="true" className="size-4" />{t(locale, "alerts.back")}</Link>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0"><p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">{t(locale, "alerts.detail")}</p><div className="mt-2 flex items-start gap-3"><Icon aria-hidden="true" className="mt-1 size-6 shrink-0 text-primary" /><h1 id="alert-title" className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{t(locale, `alerts.type.${alert.type}`)}</h1></div><p className="mt-3 max-w-3xl text-pretty text-muted-foreground">{t(locale, `alerts.summary.${alert.id}`)}</p></div>
          <div className="flex flex-wrap gap-2"><Badge variant="outline" className={severityClass[alert.severity]}>{alert.severity}</Badge><FreshnessBadge freshness={alert.freshness} locale={locale} /><Badge variant="outline" className={qualityClass[alert.dataQuality]}>{t(locale, "alerts.dataQuality")}: {alert.dataQuality}</Badge></div>
        </div>
      </header>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <Card className="border border-border shadow-none"><CardHeader><CardTitle>{t(locale, "alerts.evidence")}</CardTitle><CardDescription>Observed values compare against stored baseline and threshold.</CardDescription></CardHeader><CardContent className="space-y-3">{alert.evidence.map((evidence) => <article key={evidence.detector} className="rounded-lg border border-border p-4"><h2 className="font-semibold">{evidence.detector}</h2><dl className="mt-3 grid gap-3 sm:grid-cols-4"><div><dt className="text-xs text-muted-foreground">Baseline</dt><dd className="mt-1 font-mono text-sm tabular-nums">{evidence.baseline}</dd></div><div><dt className="text-xs text-muted-foreground">Observed</dt><dd className="mt-1 font-mono text-sm tabular-nums">{evidence.observed}</dd></div><div><dt className="text-xs text-muted-foreground">Threshold</dt><dd className="mt-1 font-mono text-sm tabular-nums">{evidence.threshold}</dd></div><div><dt className="text-xs text-muted-foreground">Window</dt><dd className="mt-1 text-sm">{evidence.window}</dd></div></dl><p className="mt-4 text-sm text-muted-foreground">Possible normal explanation: {evidence.explanation}</p></article>)}</CardContent></Card>
          {alert.type === "COMBINED_REVIEW" ? <Card className="border border-cta-gold/60 bg-cta-gold/10 shadow-none"><CardContent className="pt-4 text-sm text-primary">Underlying signals require separate review. Their timing does not establish a causal connection.</CardContent></Card> : null}
        </div>
        <aside className="space-y-4">
          <Card className="border border-border shadow-none"><CardHeader><CardTitle>Review Context</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div><p className="text-muted-foreground">Outlet</p><Link className="font-medium text-primary hover:underline" href={outletHref}>{alert.outletName}</Link></div><div><p className="text-muted-foreground">Recipient</p><p className="font-medium">{alert.recipient}</p></div><div><p className="text-muted-foreground">Owner</p><p className="font-medium">{alert.owner}</p></div><div><p className="text-muted-foreground">Linked Case</p>{alert.linkedCase && caseHref ? <Link className="font-medium text-primary hover:underline" href={caseHref}>{alert.linkedCase}</Link> : <p className="font-medium">Not created</p>}</div><div><p className="text-muted-foreground">Raised</p><p>{formatDateTime(alert.occurredAt)}</p></div></CardContent></Card>
          <Card className="border border-border shadow-none"><CardHeader><CardTitle>{t(locale, "alerts.safeNextStep")}</CardTitle></CardHeader><CardContent><p className="text-sm font-medium">{t(locale, `alerts.next.${alert.id}`)}</p></CardContent></Card>
        </aside>
      </div>
    </section>
  );
}
