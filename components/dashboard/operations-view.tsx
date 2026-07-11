import { ErrorState } from "@/components/shared/error-state";
import { PageLoading } from "@/components/shared/page-loading";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { OutletRiskTable } from "@/components/dashboard/outlet-risk-table";
import { getOutletFilterOptions, getOutletOverview, type OutletFilters } from "@/lib/operations/outlets";

export async function OperationsView({
  filters,
  variant,
  action,
}: {
  filters: OutletFilters;
  variant: "dashboard" | "outlets";
  action?: "/dashboard" | "/outlets" | "/preview/operations";
}) {
  if (filters.view === "loading") {
    return <PageLoading />;
  }

  if (filters.view === "error") {
    return <ErrorState description="Outlet data could not load. Check API availability, then try again." correlationId="fixture-outlets-001" />;
  }

  const filterAction = action ?? (variant === "dashboard" ? "/dashboard" : "/outlets");
  const source = filterAction === "/preview/operations" ? "fixture" : "api";
  const [overview, filterOptions] = await Promise.all([
    getOutletOverview(filters.view === "empty" ? { ...filters, risk: "high", freshness: "stale" } : filters, source),
    getOutletFilterOptions(source),
  ]);

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
        <p className="text-sm text-muted-foreground">{source === "fixture" ? "Fixture mode · Provider A scope" : "Live API · Authorized scope"}</p>
      </header>
      <KpiGrid kpis={overview.kpis} />
      <FilterBar action={filterAction} agents={filterOptions.agents} areas={filterOptions.areas} filters={filters} />
      <OutletRiskTable action={filterAction} detailBasePath={filterAction === "/preview/operations" ? "/preview/operations/outlets" : "/outlets"} filters={filters} items={overview.items} pageCount={overview.pageCount} total={overview.total} />
    </section>
  );
}
