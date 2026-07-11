import Link from "next/link";
import { ArrowLeftIcon, DatabaseZapIcon, LandmarkIcon, ShieldCheckIcon, WalletCardsIcon } from "lucide-react";

import { FreshnessBadge } from "@/components/shared/freshness-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/formatters/dates";
import { formatBdtMinor } from "@/lib/formatters/money";
import type { DataQuality, OutletDetail } from "@/lib/operations/outlet-detail";

const qualityPresentation: Record<DataQuality, { label: string; className: string }> = {
  good: { label: "Data Quality: Good", className: "border-success/30 bg-success/10 text-success" },
  degraded: { label: "Data Quality: Degraded", className: "border-cta-gold/60 bg-cta-gold/20 text-primary" },
  critical: { label: "Data Quality: Critical", className: "border-destructive/30 bg-destructive/10 text-destructive" },
};

export function OutletDetailView({
  outlet,
  backHref,
}: {
  outlet: OutletDetail;
  backHref: string;
}) {
  const quality = qualityPresentation[outlet.dataQuality];

  return (
    <section aria-labelledby="outlet-title" className="mx-auto max-w-7xl space-y-6">
      <header className="border-b border-border pb-5">
        <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeftIcon aria-hidden="true" className="size-4" />
          Back to Outlets
        </Link>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">Outlet Detail</p>
            <h1 id="outlet-title" className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {outlet.outletName}
            </h1>
            <p className="mt-2 text-pretty text-muted-foreground">{outlet.agentName ?? "Agent not provided by API"} · {outlet.area} · {outlet.provider.replace("_", " ")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <FreshnessBadge freshness={outlet.freshness} />
            <Badge variant="outline" className={quality.className}>{quality.label}</Badge>
          </div>
        </div>
      </header>

      <section aria-labelledby="resource-title" className="space-y-3">
        <div>
          <p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">Resource Separation</p>
          <h2 id="resource-title" className="mt-1 text-2xl font-semibold tracking-tight">Cash & Provider E-Money Are Separate</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border border-border shadow-none">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Shared Physical Cash</CardTitle>
                  <CardDescription>Outlet resource shared across authorized service activity.</CardDescription>
                </div>
                <LandmarkIcon aria-hidden="true" className="size-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-semibold tabular-nums">{outlet.sharedCashMinor === null ? "Not provided by API" : formatBdtMinor(outlet.sharedCashMinor)}</p>
              {outlet.limitingResource === "Shared physical cash" ? <p className="mt-3 text-sm font-medium text-destructive">Current limiting resource</p> : null}
            </CardContent>
          </Card>
          <Card className="border border-border shadow-none">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>{outlet.provider === "SHARED" ? "Provider E-Money" : `${outlet.provider.replace("_", " ")} E-Money`}</CardTitle>
                  <CardDescription>Provider-scoped balance. Not combined with physical cash.</CardDescription>
                </div>
                <WalletCardsIcon aria-hidden="true" className="size-6 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-semibold tabular-nums">{outlet.providerEfloatMinor === null ? "Not provided by API" : formatBdtMinor(outlet.providerEfloatMinor)}</p>
              {outlet.limitingResource.endsWith("e-money") ? <p className="mt-3 text-sm font-medium text-destructive">Current limiting resource</p> : null}
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-labelledby="forecast-title" className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">Forecast Ladder</p>
            <h2 id="forecast-title" className="mt-1 text-2xl font-semibold tracking-tight">Range, Threshold ETA & Confidence</h2>
          </div>
          <p className="text-sm text-muted-foreground">Last updated {formatDateTime(outlet.updatedAt)}</p>
        </div>
        {outlet.forecast === null ? (
          <Card className="border border-destructive/30 bg-destructive/5 shadow-none" role="alert">
            <CardHeader>
              <div className="flex items-start gap-3">
                <DatabaseZapIcon aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-destructive" />
                <div>
                  <CardTitle>Exact Forecast Withheld</CardTitle>
                  <CardDescription>Critical data quality prevents a reliable projected balance or threshold ETA.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{outlet.safeNextStep ?? "No safe next step supplied by API."}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {outlet.forecast.map((point) => (
                <Card key={point.label} className="border border-border shadow-none">
                  <CardContent className="pt-4">
                    <p className="text-sm font-medium text-muted-foreground">{point.label}</p>
                    <p className="mt-3 font-mono text-xs tabular-nums">{formatBdtMinor(point.lowMinor)} – {formatBdtMinor(point.highMinor)}</p>
                    <p className="mt-2 text-sm font-semibold">Expected {formatBdtMinor(point.expectedMinor)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="border border-border shadow-none">
              <CardContent className="grid gap-4 pt-4 sm:grid-cols-3">
                <div><p className="text-sm text-muted-foreground">Limiting Resource</p><p className="mt-1 font-medium">{outlet.limitingResource}</p></div>
                <div><p className="text-sm text-muted-foreground">Threshold ETA</p><p className="mt-1 font-mono font-semibold tabular-nums">{outlet.thresholdEtaMinutes === null ? "Not projected" : `${outlet.thresholdEtaMinutes} min`}</p></div>
                <div><p className="text-sm text-muted-foreground">Model Confidence</p><p className="mt-1 font-mono font-semibold tabular-nums">{Math.round(outlet.confidence * 100)}%</p></div>
              </CardContent>
            </Card>
          </>
        )}
      </section>

      <Card className="border border-border shadow-none">
        <CardHeader>
          <div className="flex items-start gap-3">
            <ShieldCheckIcon aria-hidden="true" className="mt-0.5 size-6 text-primary" />
            <div>
              <CardTitle>Safe Next Step</CardTitle>
              <CardDescription>Decision support only. No financial action is available in this view.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent><p className="text-sm font-medium">{outlet.safeNextStep ?? "No safe next step supplied by API."}</p></CardContent>
      </Card>

      <section aria-labelledby="transactions-title" className="space-y-3">
        <div>
          <p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">Recent Activity</p>
          <h2 id="transactions-title" className="mt-1 text-2xl font-semibold tracking-tight">Transactions</h2>
        </div>
        <Card className="border border-border shadow-none">
          <CardContent className="px-0">
            <Table>
              <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Type</TableHead><TableHead>Provider</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {outlet.transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="whitespace-normal text-sm">{formatDateTime(transaction.occurredAt)}</TableCell>
                    <TableCell>{transaction.type.replace("_", " ")}</TableCell>
                    <TableCell>{transaction.provider.replace("_", " ")}</TableCell>
                    <TableCell className="font-mono tabular-nums">{formatBdtMinor(transaction.amountMinor)}</TableCell>
                    <TableCell><Badge variant={transaction.status === "SETTLED" ? "outline" : "secondary"}>{transaction.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
