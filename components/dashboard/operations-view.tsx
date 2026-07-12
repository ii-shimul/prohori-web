"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, CircleAlertIcon, CircleCheckIcon, Clock3Icon, ActivityIcon, CircleAlertIcon as AlertIcon, ListChecksIcon, RadioTowerIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { FreshnessBadge } from "@/components/shared/freshness-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBdtMinor } from "@/lib/formatters/money";

import { minimalApiRequest } from "@/lib/api/minimal-client";
import { PageLoading } from "@/components/shared/page-loading";
import { ErrorState } from "@/components/shared/error-state";
import type { Provider, RiskLevel } from "@/types/domain";
import type { Freshness } from "@/lib/formatters/status";
import { mapFreshness, toRiskLevel } from "@/lib/operations/live-data";

type OutletRisk = {
  id: string;
  outletName: string;
  area: string;
  agentName: string;
  provider: Provider | "SHARED";
  limitingResource: string;
  forecastLowMinor: string | null;
  forecastExpectedMinor: string | null;
  forecastHighMinor: string | null;
  thresholdEtaMinutes: number | null;
  risk: RiskLevel;
  confidence: number;
  freshness: Freshness;
  lastActivityHours: number | null;
  openCases: number | null;
  highAlerts: number | null;
};

type Kpis = {
  outletsUnderPressure: number;
  highAlerts: number;
  staleFeeds: number;
  openCases: number;
};

const riskPresentation = {
  high: { label: "High Risk", icon: CircleAlertIcon, className: "border-destructive/30 bg-destructive/10 text-destructive" },
  medium: { label: "Medium Risk", icon: Clock3Icon, className: "border-cta-gold/60 bg-cta-gold/20 text-primary" },
  low: { label: "Low Risk", icon: CircleCheckIcon, className: "border-success/30 bg-success/10 text-success" },
} as const;

export function OperationsView({ variant }: { variant: "dashboard" | "outlets" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Raw API data
  const [outlets, setOutlets] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [kpis, setKpis] = useState<Kpis>({
    outletsUnderPressure: 0,
    highAlerts: 0,
    staleFeeds: 0,
    openCases: 0,
  });

  // Derived outlet rows with health and forecasts loaded
  const [rows, setRows] = useState<OutletRisk[]>([]);

  // Filter States
  const [filterProvider, setFilterProvider] = useState<string>("all");
  const [filterArea, setFilterArea] = useState<string>("all");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [filterFreshness, setFilterFreshness] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [outlets, providers, areas, alerts, cases] = await Promise.all([
        minimalApiRequest<any[]>("outlets"),
        minimalApiRequest<any[]>("providers"),
        minimalApiRequest<any[]>("areas"),
        minimalApiRequest<any[]>("alerts", { query: { active: "true" } }),
        minimalApiRequest<any[]>("cases"),
      ]);

      const rawOutlets = outlets;
      const rawProviders = providers;
      const rawAreas = areas;
      const rawAlerts = alerts;
      const rawCases = cases;

      setProviders(rawProviders);
      setAreas(rawAreas);
      setOutlets(rawOutlets);

      const providerById = new Map(rawProviders.map((p) => [p.id, p.code]));

      // Fetch health and forecast details for ALL outlets (N is small, so we do in parallel)
      const detailRows = await Promise.all(
        rawOutlets.map(async (outlet) => {
          try {
            const [health, forecast] = await Promise.all([
              minimalApiRequest<any>(`outlets/${outlet.id}/health`),
              minimalApiRequest<any>(`outlets/${outlet.id}/forecasts`),
            ]);

            const limiting = health.limitingResource;
            const provider = limiting?.providerId ? providerById.get(limiting.providerId) ?? "SHARED" : "SHARED";
            const resource = forecast.resources?.find(
              (item: any) => item.resource === limiting?.resource && item.providerId === limiting?.providerId
            ) ?? forecast.resources?.[0];
            const point = resource?.points?.at(-1);

            const risk = toRiskLevel(point?.riskBand) as RiskLevel;

            const freshness = mapFreshness(health.dataQuality) as Freshness;

            const outletRisk: OutletRisk = {
              id: outlet.id,
              outletName: outlet.name,
              area: outlet.area?.name || "Unknown",
              agentName: "Not provided by API",
              provider,
              limitingResource: limiting?.resource === "provider_efloat" ? "Provider e-money" : "Shared physical cash",
              forecastLowMinor: point?.projectedLowMinor ?? null,
              forecastExpectedMinor: point?.projectedMidMinor ?? null,
              forecastHighMinor: point?.projectedHighMinor ?? null,
              thresholdEtaMinutes: point?.reserveEtaMinutes ?? null,
              risk,
              confidence: health.modelConfidence || 0.9,
              freshness,
              lastActivityHours: null,
              openCases: null,
              highAlerts: null,
            };

            return outletRisk;
          } catch (e) {
            console.error(`Failed to load details for outlet ${outlet.id}`, e);
            return null;
          }
        })
      );

      const validRows = detailRows.filter((row): row is OutletRisk => row !== null);
      setRows(validRows);

      const typedRows = validRows;

      // Compute KPIs
      const activeHighAlerts = rawAlerts.filter(
        (a: any) => a.severity === "high" || a.severity === "critical"
      ).length;

      const activeCases = rawCases.filter(
        (c: any) => c.state !== "RESOLVED" && c.state !== "CLOSED"
      ).length;

      const underPressure = typedRows.filter((r) => r.risk === "high").length;
      const staleCount = typedRows.filter((r) => r.freshness === "stale").length;

      setKpis({
        outletsUnderPressure: underPressure,
        highAlerts: activeHighAlerts,
        staleFeeds: staleCount,
        openCases: activeCases,
      });

      setLoading(false);
    } catch (err: any) {
      console.error("Dashboard data load failed", err);
      setError(err.message || "Failed to load dashboard data. Ensure backend is running.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <PageLoading />;
  if (error) return <ErrorState description={error} correlationId="dashboard-load-error" />;

  // Client side filtering & sorting
  const filteredRows = rows
    .filter((row) => filterProvider === "all" || row.provider === filterProvider)
    .filter((row) => filterArea === "all" || row.area === filterArea)
    .filter((row) => filterRisk === "all" || row.risk === filterRisk)
    .filter((row) => filterFreshness === "all" || row.freshness === filterFreshness)
    .sort((left, right) => {
      const riskScore = { high: 3, medium: 2, low: 1 };
      const leftScore = riskScore[left.risk];
      const rightScore = riskScore[right.risk];
      if (leftScore !== rightScore) return rightScore - leftScore;
      return (left.thresholdEtaMinutes ?? Infinity) - (right.thresholdEtaMinutes ?? Infinity);
    });

  const totalRows = filteredRows.length;
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
  const pageIndex = Math.min(currentPage, pageCount);
  const pagedRows = filteredRows.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);

  const selectClassName = "h-9 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  return (
    <section aria-labelledby="page-title" className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-3 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">Provider Operations</p>
          <h1 id="page-title" className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {variant === "dashboard" ? "Liquidity Dispatch Board" : "Outlet Priority Queue"}
          </h1>
          <p className="mt-2 max-w-3xl text-pretty text-muted-foreground">
            {variant === "dashboard"
              ? "See which resource constrains service first, then verify data before escalation."
              : "Filter authorized outlets by risk, freshness, owner, area, and activity window."}
          </p>
        </div>
        <p className="text-sm text-muted-foreground font-medium">Live API · Authorized scope</p>
      </header>

      {/* KPI Summary Cards */}
      <section aria-label="Operations summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Outlets Under Pressure", value: kpis.outletsUnderPressure, icon: ActivityIcon, tone: "text-destructive" },
          { label: "High Alerts", value: kpis.highAlerts, icon: AlertIcon, tone: "text-destructive" },
          { label: "Stale Feeds", value: kpis.staleFeeds, icon: RadioTowerIcon, tone: "text-primary" },
          { label: "Open Cases", value: kpis.openCases, icon: ListChecksIcon, tone: "text-primary" },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="border border-border shadow-none">
              <CardContent className="flex items-start justify-between gap-3 pt-4">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">{kpi.value}</p>
                </div>
                <Icon aria-hidden="true" className={`size-5 shrink-0 ${kpi.tone}`} />
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Filter Bar */}
      <div className="grid gap-3 rounded-xl border border-border bg-background p-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
        <label className="min-w-0 space-y-1.5 text-sm font-medium flex flex-col">
          Provider
          <select
            className={selectClassName}
            value={filterProvider}
            onChange={(e) => { setFilterProvider(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Scoped Providers</option>
            {providers.map((p) => <option key={p.id} value={p.code}>{p.name}</option>)}
          </select>
        </label>
        <label className="min-w-0 space-y-1.5 text-sm font-medium flex flex-col">
          Area
          <select
            className={selectClassName}
            value={filterArea}
            onChange={(e) => { setFilterArea(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Areas</option>
            {areas.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>
        </label>
        <label className="min-w-0 space-y-1.5 text-sm font-medium flex flex-col">
          Risk
          <select
            className={selectClassName}
            value={filterRisk}
            onChange={(e) => { setFilterRisk(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </label>
        <label className="min-w-0 space-y-1.5 text-sm font-medium flex flex-col">
          Freshness
          <select
            className={selectClassName}
            value={filterFreshness}
            onChange={(e) => { setFilterFreshness(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Freshness States</option>
            <option value="fresh">Fresh</option>
            <option value="degraded">Degraded</option>
            <option value="stale">Stale</option>
          </select>
        </label>
        <Button
          className="self-end cursor-pointer"
          onClick={() => {
            setFilterProvider("all");
            setFilterArea("all");
            setFilterRisk("all");
            setFilterFreshness("all");
            setCurrentPage(1);
          }}
          type="button"
          variant="outline"
        >
          Clear
        </Button>
      </div>

      {/* Outlet Risk Table */}
      {pagedRows.length === 0 ? (
        <EmptyState
          title="No Outlets Match These Filters"
          description="Change one or more filters to view outlets in your authorized provider scope."
          action={<Button onClick={() => { setFilterProvider("all"); setFilterArea("all"); setFilterRisk("all"); setFilterFreshness("all"); }} type="button">Clear Filters</Button>}
        />
      ) : (
        <Card className="border border-border shadow-none">
          <CardHeader className="border-b border-border">
            <CardTitle>Priority Outlet Queue</CardTitle>
            <CardDescription>{totalRows} scoped outlets ranked by risk and threshold ETA.</CardDescription>
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
                  {pagedRows.map((outlet) => {
                    const risk = riskPresentation[outlet.risk];
                    const RiskIcon = risk.icon;

                    return (
                      <TableRow key={outlet.id}>
                        <TableCell className="min-w-60 whitespace-normal">
                          <Link className="font-medium text-primary hover:underline" href={`/outlets/${outlet.id}`}>
                            {outlet.outletName}
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground">{outlet.agentName} · {outlet.area}</p>
                        </TableCell>
                        <TableCell className="min-w-44 whitespace-normal">
                          <p className="font-medium">{outlet.limitingResource}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{outlet.provider.replace("_", " ")}</p>
                        </TableCell>
                        <TableCell className="min-w-52 whitespace-normal font-mono text-xs tabular-nums">
                          <span>
                            {outlet.forecastLowMinor === null || outlet.forecastHighMinor === null
                              ? "Not provided by API"
                              : `${formatBdtMinor(outlet.forecastLowMinor)} – ${formatBdtMinor(outlet.forecastHighMinor)}`}
                          </span>
                          <span className="mt-1 block text-muted-foreground">
                            {outlet.forecastExpectedMinor === null
                              ? "Expected value not provided"
                              : `Expected ${formatBdtMinor(outlet.forecastExpectedMinor)}`}
                          </span>
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
                        <TableCell>
                          <FreshnessBadge freshness={outlet.freshness} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {pageCount > 1 ? (
              <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
                <p className="text-sm text-muted-foreground">Page {pageIndex} of {pageCount}</p>
                <div className="flex gap-2">
                  {pageIndex > 1 && (
                    <Button onClick={() => setCurrentPage(pageIndex - 1)} size="sm" type="button" variant="outline">
                      Previous
                    </Button>
                  )}
                  {pageIndex < pageCount && (
                    <Button onClick={() => setCurrentPage(pageIndex + 1)} size="sm" type="button">
                      Next <ArrowRightIcon aria-hidden="true" />
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
