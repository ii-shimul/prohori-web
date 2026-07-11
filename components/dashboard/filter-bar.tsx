import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { OutletFilters } from "@/lib/operations/outlets";

const selectClassName = "h-9 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function FilterBar({
  filters,
  agents,
  areas,
  action,
}: {
  filters: OutletFilters;
  agents: string[];
  areas: string[];
  action: "/dashboard" | "/outlets" | "/preview/operations";
}) {
  return (
    <form action={action} className="grid gap-3 rounded-xl border border-border bg-background p-4 lg:grid-cols-[repeat(6,minmax(0,1fr))_auto_auto]">
      <label className="min-w-0 space-y-1.5 text-sm font-medium">
        Provider
        <select className={selectClassName} defaultValue={filters.provider} name="provider">
          <option value="all">All Scoped Providers</option>
          <option value="PROVIDER_A">Provider A</option>
        </select>
      </label>
      <label className="min-w-0 space-y-1.5 text-sm font-medium">
        Agent
        <select className={selectClassName} defaultValue={filters.agent} name="agent">
          <option value="all">All Agents</option>
          {agents.map((agent) => <option key={agent} value={agent}>{agent}</option>)}
        </select>
      </label>
      <label className="min-w-0 space-y-1.5 text-sm font-medium">
        Area
        <select className={selectClassName} defaultValue={filters.area} name="area">
          <option value="all">All Areas</option>
          {areas.map((area) => <option key={area} value={area}>{area}</option>)}
        </select>
      </label>
      <label className="min-w-0 space-y-1.5 text-sm font-medium">
        Time
        <select className={selectClassName} defaultValue={filters.time} name="time">
          <option value="4h">Last 4 Hours</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </label>
      <label className="min-w-0 space-y-1.5 text-sm font-medium">
        Risk
        <select className={selectClassName} defaultValue={filters.risk} name="risk">
          <option value="all">All Risk Levels</option>
          <option value="high">High Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="low">Low Risk</option>
        </select>
      </label>
      <label className="min-w-0 space-y-1.5 text-sm font-medium">
        Freshness
        <select className={selectClassName} defaultValue={filters.freshness} name="freshness">
          <option value="all">All Freshness States</option>
          <option value="fresh">Fresh</option>
          <option value="degraded">Degraded</option>
          <option value="stale">Stale</option>
        </select>
      </label>
      <Button className="self-end" type="submit">Apply Filters</Button>
      <Button className="self-end" render={<Link href={action} />} type="button" variant="outline">Clear</Button>
    </form>
  );
}
