"use client";

import { useEffect, useState } from "react";
import { DatabaseZapIcon, ShieldAlertIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FreshnessBadge } from "@/components/shared/freshness-badge";
import { PageLoading } from "@/components/shared/page-loading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/formatters/dates";
import { minimalApiRequest } from "@/lib/api/minimal-client";
import type { FeedHealthFilters, FeedHealthIncident } from "@/lib/operations/feed-health";

const issueLabels = {
  STALE: "Stale Feed",
  MISSING_FIELDS: "Missing Fields",
  SEQUENCE_GAP: "Sequence Gap",
  DUPLICATE: "Duplicate / Replay",
  OUT_OF_ORDER: "Out of Order",
  MISMATCH: "Mismatch",
  CONFLICT: "Conflict",
} as const;

export function FeedHealthView({
  filters,
  source = "api",
}: {
  filters: FeedHealthFilters;
  source?: "fixture" | "api";
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<FeedHealthIncident[]>([]);

  useEffect(() => {
    async function loadIncidents() {
      try {
        setLoading(true);
        setError(null);

        const [feedHealth, incidentsData, providers, outlets] = await Promise.all([
          minimalApiRequest<any>("feed-health"),
          minimalApiRequest<any>("data-quality/incidents"),
          minimalApiRequest<any[]>("providers"),
          minimalApiRequest<any[]>("outlets"),
        ]);

        const providerById = new Map(providers.map((p) => [p.id, p]));
        const outletById = new Map(outlets.map((o) => [o.id, o]));

        const mapped: FeedHealthIncident[] = incidentsData.items.map((incident: any) => {
          const provider = incident.providerId ? providerById.get(incident.providerId) : undefined;
          const outlet = incident.outletId ? outletById.get(incident.outletId) : undefined;
          const health = incident.providerId ? feedHealth.items?.find((item: any) => item.providerId === incident.providerId) : undefined;
          const details = (incident.details ?? {}) as Record<string, unknown>;

          const detail =
            typeof details.description === "string" ? details.description
            : typeof details.message === "string" ? details.message
            : typeof details.reason === "string" ? details.reason
            : `${incident.category.replace(/_/g, " ")} incident detected.`;

          const safeNextStep =
            typeof details.nextStep === "string" ? details.nextStep
            : incident.category === "STALE" ? "Verify source availability before relying on forecast output."
            : incident.category === "DUPLICATE" ? "Confirm replay handling and keep deduplication evidence with incident review."
            : incident.category === "SEQUENCE_GAP" ? "Request replay or confirm records were not emitted before relying on velocity evidence."
            : incident.category === "CONFLICT" ? "Reconcile accepted sequence before using forecast output."
            : "Verify data before relying on any forecast or escalating the case.";

          const lagSeconds = typeof details.lagSeconds === "number" ? details.lagSeconds : null;
          const lag = lagSeconds != null
            ? lagSeconds >= 3600
              ? `${Math.floor(lagSeconds / 3600)} hr ${Math.floor((lagSeconds % 3600) / 60)} min`
              : `${Math.floor(lagSeconds / 60)} min`
            : null;

          const dataQuality = health?.dataQuality || "healthy";
          const freshness = dataQuality === "healthy" ? "fresh" : dataQuality === "degraded" ? "degraded" : "stale";

          return {
            id: incident.id,
            source: provider?.name ?? (incident.providerId ? `Provider ${incident.providerId.slice(0, 8)}` : "Provider not specified"),
            freshness,
            lag,
            issue: incident.category,
            affectedScope: outlet?.name ?? (incident.outletId ? `Outlet ${incident.outletId.slice(0, 8)}` : "Scope not specified"),
            observedAt: incident.detectedAt,
            confidenceEffect: health ? `${health.dataQuality === "healthy" ? "Normal" : health.dataQuality === "degraded" ? "Reduced" : "Critical"}: confidence affected` : null,
            detail,
            safeNextStep,
          };
        });

        setIncidents(mapped);
        setLoading(false);
      } catch (err: any) {
        console.error("Failed to load feed incidents", err);
        setError(err.message || "Failed to load feed incidents.");
        setLoading(false);
      }
    }

    if (filters.view === "loading") {
      setLoading(true);
    } else if (filters.view === "error") {
      setError("Mock error view triggered");
      setLoading(false);
    } else if (filters.view === "empty") {
      setIncidents([]);
      setLoading(false);
    } else {
      loadIncidents();
    }
  }, [filters.view]);

  if (loading) return <PageLoading />;
  if (error) return <ErrorState description={error} correlationId="feed-health-error" />;

  return (
    <section aria-labelledby="feed-health-title" className="mx-auto max-w-6xl space-y-6">
      <header className="border-b border-border pb-5">
        <p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">Data Quality Review</p>
        <h1 id="feed-health-title" className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Feed Health</h1>
        <p className="mt-2 max-w-3xl text-pretty text-muted-foreground font-medium">Review freshness, lag, missing fields, sequencing, replay, ordering, mismatch, and conflict evidence. Quality issues reduce confidence; they do not prove an operational cause.</p>
      </header>

      {incidents.length === 0 ? (
        <EmptyState title="No Feed Incidents Match" description="No feed-health incidents are available for this authorized scope." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {incidents.map((incident) => (
            <Card key={incident.id} className="border border-border shadow-none">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <DatabaseZapIcon aria-hidden="true" className="size-5 shrink-0 text-primary" />
                      <CardTitle className="text-balance">{issueLabels[incident.issue as keyof typeof issueLabels] ?? incident.issue}</CardTitle>
                    </div>
                    <CardDescription className="mt-2 break-words">{incident.source} · {incident.affectedScope}</CardDescription>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {incident.freshness ? <FreshnessBadge freshness={incident.freshness} /> : <Badge variant="outline">Freshness not provided</Badge>}
                    {incident.lag ? <Badge variant="outline" className="border-border bg-muted text-foreground">Lag: {incident.lag}</Badge> : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="grid gap-3 rounded-lg bg-muted p-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Observed</dt>
                    <dd className="mt-1 font-medium tabular-nums">{formatDateTime(incident.observedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Confidence Effect</dt>
                    <dd className="mt-1 font-medium">{incident.confidenceEffect ?? "Not provided by API"}</dd>
                  </div>
                </dl>
                <p className="text-pretty text-sm leading-6">{incident.detail}</p>
                <div className="border-t border-border pt-3">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Safe Next Step</p>
                  <p className="mt-1 text-sm">{incident.safeNextStep ?? "No safe next step supplied by API."}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
