import { DatabaseZapIcon, ShieldAlertIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FreshnessBadge } from "@/components/shared/freshness-badge";
import { PageLoading } from "@/components/shared/page-loading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/formatters/dates";
import { getFeedHealthIncidents, type FeedHealthFilters } from "@/lib/operations/feed-health";

const issueLabels = {
  MISSING_FIELDS: "Missing Fields",
  SEQUENCE_GAP: "Sequence Gap",
  DUPLICATE_REPLAY: "Duplicate / Replay",
  OUT_OF_ORDER: "Out of Order",
  MISMATCH: "Mismatch",
  CONFLICT: "Conflict",
} as const;

export async function FeedHealthView({
  filters,
  source = "fixture",
}: {
  filters: FeedHealthFilters;
  source?: "fixture" | "api";
}) {
  if (filters.view === "loading") return <PageLoading />;
  if (filters.view === "error") return <ErrorState description="Feed-health data could not load. Check API availability, then try again." correlationId="fixture-feed-health-001" />;

  const incidents = filters.view === "empty" ? [] : await getFeedHealthIncidents(source);

  return (
    <section aria-labelledby="feed-health-title" className="mx-auto max-w-6xl space-y-6">
      <header className="border-b border-border pb-5">
        <p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">Data Quality Review</p>
        <h1 id="feed-health-title" className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Feed Health</h1>
        <p className="mt-2 max-w-3xl text-pretty text-muted-foreground">Review freshness, lag, missing fields, sequencing, replay, ordering, mismatch, and conflict evidence. Quality issues reduce confidence; they do not prove an operational cause.</p>
      </header>
      {source === "fixture" ? (
        <Card className="border border-cta-gold/60 bg-cta-gold/10 shadow-none" role="alert">
          <CardHeader><div className="flex items-center gap-2"><ShieldAlertIcon aria-hidden="true" className="size-5 text-primary" /><CardTitle>Forecast Confidence Is Degraded</CardTitle></div><CardDescription>Scenario C has a stale conflicting balance source. Exact forecast remains withheld until verification completes.</CardDescription></CardHeader>
        </Card>
      ) : null}
      {incidents.length === 0 ? <EmptyState title="No Feed Incidents Match" description="No feed-health incidents are available for this authorized scope." /> : <div className="grid gap-4 lg:grid-cols-2">{incidents.map((incident) => <Card key={incident.id} className="border border-border shadow-none"><CardHeader><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex items-center gap-2"><DatabaseZapIcon aria-hidden="true" className="size-5 shrink-0 text-primary" /><CardTitle className="text-balance">{issueLabels[incident.issue as keyof typeof issueLabels] ?? incident.issue}</CardTitle></div><CardDescription className="mt-2 break-words">{incident.source} · {incident.affectedScope}</CardDescription></div><div className="flex shrink-0 flex-wrap gap-2">{incident.freshness ? <FreshnessBadge freshness={incident.freshness} /> : <Badge variant="outline">Freshness not provided</Badge>}{incident.lag ? <Badge variant="outline" className="border-border bg-muted text-foreground">Lag: {incident.lag}</Badge> : null}</div></div></CardHeader><CardContent className="space-y-4"><dl className="grid gap-3 rounded-lg bg-muted p-3 text-sm sm:grid-cols-2"><div><dt className="text-xs text-muted-foreground">Observed</dt><dd className="mt-1 font-medium tabular-nums">{formatDateTime(incident.observedAt)}</dd></div><div><dt className="text-xs text-muted-foreground">Confidence Effect</dt><dd className="mt-1 font-medium">{incident.confidenceEffect ?? "Not provided by API"}</dd></div></dl><p className="text-pretty text-sm leading-6">{incident.detail}</p><div className="border-t border-border pt-3"><p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Safe Next Step</p><p className="mt-1 text-sm">{incident.safeNextStep ?? "No safe next step supplied by API."}</p></div></CardContent></Card>)}</div>}
    </section>
  );
}
