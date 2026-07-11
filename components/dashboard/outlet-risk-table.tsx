import Link from "next/link";
import { ArrowRightIcon, CircleAlertIcon, CircleCheckIcon, Clock3Icon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { FreshnessBadge } from "@/components/shared/freshness-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBdtMinor } from "@/lib/formatters/money";
import type { OutletFilters, OutletRisk } from "@/lib/operations/outlets";

const riskPresentation = {
  high: { label: "High Risk", icon: CircleAlertIcon, className: "border-destructive/30 bg-destructive/10 text-destructive" },
  medium: { label: "Medium Risk", icon: Clock3Icon, className: "border-cta-gold/60 bg-cta-gold/20 text-primary" },
  low: { label: "Low Risk", icon: CircleCheckIcon, className: "border-success/30 bg-success/10 text-success" },
} as const;

function filterHref(action: "/dashboard" | "/outlets" | "/preview/operations", filters: OutletFilters, page: number) {
  const searchParams = new URLSearchParams();
  const entries = { ...filters, page: String(page), view: "default" };

  Object.entries(entries).forEach(([key, value]) => {
    if (value !== "all" && value !== "default") {
      searchParams.set(key, String(value));
    }
  });

  return `${action}?${searchParams.toString()}`;
}

export function OutletRiskTable({
  filters,
  items,
  total,
  pageCount,
  action,
  detailBasePath,
}: {
  filters: OutletFilters;
  items: OutletRisk[];
  total: number;
  pageCount: number;
  action: "/dashboard" | "/outlets" | "/preview/operations";
  detailBasePath: "/outlets" | "/preview/operations/outlets";
}) {
  if (items.length === 0) {
    return <EmptyState title="No Outlets Match These Filters" description="Change one or more filters to view outlets in your authorized provider scope." action={<Button render={<Link href={action} />} type="button">Clear Filters</Button>} />;
  }

  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="border-b border-border">
        <CardTitle>Priority Outlet Queue</CardTitle>
        <CardDescription>{total} scoped outlets ranked by risk and threshold ETA.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto" aria-label="Scrollable priority outlet table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Outlet</TableHead>
              <TableHead>Limiting Resource</TableHead>
              <TableHead>Forecast Range</TableHead>
              <TableHead>Threshold ETA</TableHead>
              <TableHead>Risk & Confidence</TableHead>
              <TableHead>Freshness</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((outlet) => {
              const risk = riskPresentation[outlet.risk];
              const RiskIcon = risk.icon;

              return (
                <TableRow key={outlet.id}>
                  <TableCell className="min-w-60 whitespace-normal">
                    <Link className="font-medium text-primary hover:underline" href={`${detailBasePath}/${outlet.id}`}>
                      {outlet.outletName}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">{outlet.agentName} · {outlet.area}</p>
                  </TableCell>
                  <TableCell className="min-w-44 whitespace-normal">
                    <p className="font-medium">{outlet.limitingResource}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{outlet.provider.replace("_", " ")}</p>
                  </TableCell>
                  <TableCell className="min-w-52 whitespace-normal font-mono text-xs tabular-nums">
                    <span>{outlet.forecastLowMinor === null || outlet.forecastHighMinor === null ? "Not provided by API" : `${formatBdtMinor(outlet.forecastLowMinor)} – ${formatBdtMinor(outlet.forecastHighMinor)}`}</span>
                    <span className="mt-1 block text-muted-foreground">{outlet.forecastExpectedMinor === null ? "Expected value not provided" : `Expected ${formatBdtMinor(outlet.forecastExpectedMinor)}`}</span>
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">
                    {outlet.thresholdEtaMinutes === null ? "Not projected" : `${outlet.thresholdEtaMinutes} min`}
                  </TableCell>
                  <TableCell className="min-w-36 whitespace-normal">
                    <Badge variant="outline" className={risk.className}>
                      <RiskIcon aria-hidden="true" className="size-3" />
                      {risk.label}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">{Math.round(outlet.confidence * 100)}% confidence</p>
                  </TableCell>
                  <TableCell><FreshnessBadge freshness={outlet.freshness} /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </div>
        {pageCount > 1 ? (
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">Page {filters.page} of {pageCount}</p>
            <div className="flex gap-2">
              {filters.page > 1 ? <Button render={<Link href={filterHref(action, filters, filters.page - 1)} />} size="sm" type="button" variant="outline">Previous</Button> : null}
              {filters.page < pageCount ? <Button render={<Link href={filterHref(action, filters, filters.page + 1)} />} size="sm" type="button">Next <ArrowRightIcon aria-hidden="true" /></Button> : null}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
