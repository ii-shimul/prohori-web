"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanbanIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import { minimalApiRequest } from "@/lib/api/minimal-client";
import { PageLoading } from "@/components/shared/page-loading";
import { ErrorState } from "@/components/shared/error-state";
import type { CaseRecord } from "@/lib/operations/cases";

const stateClass = {
  OPEN: "border-destructive/30 bg-destructive/10 text-destructive",
  ACKNOWLEDGED: "border-cta-gold/60 bg-cta-gold/20 text-primary",
  INVESTIGATING: "border-secondary/30 bg-secondary/10 text-primary",
  ESCALATED: "border-destructive/30 bg-destructive/10 text-destructive",
  RESOLVED: "border-success/30 bg-success/10 text-success",
  CLOSED: "border-border bg-muted text-muted-foreground",
} as const;

export function CaseStateBadge({ state, locale = "en" }: { state: keyof typeof stateClass; locale?: Locale }) {
  return (
    <Badge variant="outline" className={stateClass[state]}>
      {t(locale, `status.${state}`)}
    </Badge>
  );
}

export function CasesView({ variant }: { variant: "cases" | "preview" }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cases, setCases] = useState<CaseRecord[]>([]);

  useEffect(() => {
    // Read locale
    const match = document.cookie.match(/prohori_locale=(bn|en)/);
    if (match?.[1]) {
      setLocale(match[1] as Locale);
    }

    async function loadCases() {
      try {
        setLoading(true);
        setError(null);

        const [rawCases, rawOutlets, rawProviders] = await Promise.all([
          minimalApiRequest<any[]>("cases"),
          minimalApiRequest<any[]>("outlets"),
          minimalApiRequest<any[]>("providers"),
        ]);

        const providerById = new Map(rawProviders.map((p) => [p.id, p.code]));
        const outletById = new Map(rawOutlets.map((o) => [o.id, o]));

        const mappedCases: CaseRecord[] = rawCases.map((c: any) => {
          const outlet = outletById.get(c.outletId);
          const provider = providerById.get(c.providerId) || "SHARED";
          const outletName = outlet?.name || `Outlet ${c.outletId.slice(0, 8)}`;
          const title = `${outletName} — ${c.state.charAt(0) + c.state.slice(1).toLowerCase()} case`;
          const owner = c.ownerUserId ? `User ${c.ownerUserId.slice(0, 8)}…` : "Unassigned";

          return {
            id: c.id,
            title,
            provider,
            outletId: c.outletId,
            outletName,
            severity: null,
            alertId: c.alertId || null,
            state: c.state,
            version: c.version || 1,
            owner,
            notes: [],
            timeline: [],
          };
        });

        setCases(mappedCases);
        setLoading(false);
      } catch (err: any) {
        console.error("Failed to load cases", err);
        setError(err.message || "Failed to load cases.");
        setLoading(false);
      }
    }

    loadCases();
  }, []);

  if (loading) return <PageLoading />;
  if (error) return <ErrorState description={error} correlationId="cases-load-error" />;

  return (
    <section aria-labelledby="cases-title" className="mx-auto max-w-6xl space-y-6">
      <header className="border-b border-border pb-5">
        <p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">
          {t(locale, "cases.queue")}
        </p>
        <h1 id="cases-title" className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {t(locale, "cases.title")}
        </h1>
        <p className="mt-2 max-w-3xl text-pretty text-muted-foreground">
          Track human review from acknowledgement through closure. Every action must leave an audit event.
        </p>
      </header>

      {cases.length === 0 ? (
        <EmptyState title="No Open Cases" description="New review cases will appear here when alerts require coordination." />
      ) : (
        <div className="space-y-4">
          {cases.map((caseRecord) => (
            <Card key={caseRecord.id} className="border border-border shadow-none transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <FolderKanbanIcon aria-hidden="true" className="size-5 text-primary" />
                      <CardTitle>{caseRecord.title}</CardTitle>
                    </div>
                    <CardDescription className="mt-2">
                      {caseRecord.outletName} · Owner: {caseRecord.owner}
                    </CardDescription>
                  </div>
                  <CaseStateBadge state={caseRecord.state} locale={locale} />
                </div>
              </CardHeader>
              <CardContent>
                <Link className="text-sm font-medium text-primary hover:underline" href={`/cases/${caseRecord.id}`}>
                  {t(locale, "cases.open")}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
