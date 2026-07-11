import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { AlertFilters } from "@/lib/operations/alerts";

const selectClassName = "h-9 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function AlertFiltersBar({
  filters,
  action,
}: {
  filters: AlertFilters;
  action: "/alerts" | "/preview/operations/alerts";
}) {
  return (
    <form action={action} className="grid gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto_auto]">
      <label className="space-y-1.5 text-sm font-medium">Severity<select className={selectClassName} defaultValue={filters.severity} name="severity"><option value="all">All Severities</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select></label>
      <label className="space-y-1.5 text-sm font-medium">Status<select className={selectClassName} defaultValue={filters.status} name="status"><option value="all">All Statuses</option><option value="active">Active</option><option value="acknowledged">Acknowledged</option><option value="escalated">Escalated</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></label>
      <label className="space-y-1.5 text-sm font-medium">Alert Type<select className={selectClassName} defaultValue={filters.type} name="type"><option value="all">All Alert Types</option><option value="LIQUIDITY_PRESSURE">Liquidity Pressure</option><option value="UNUSUAL_ACTIVITY">Unusual Activity</option><option value="DATA_INCONSISTENCY">Data Inconsistency</option><option value="COMBINED_REVIEW">Combined Review</option></select></label>
      <label className="space-y-1.5 text-sm font-medium">Data Quality<select className={selectClassName} defaultValue={filters.dataQuality} name="dataQuality"><option value="all">All Quality States</option><option value="good">Good</option><option value="degraded">Degraded</option><option value="critical">Critical</option></select></label>
      <Button className="self-end" type="submit">Apply Filters</Button>
      <Button className="self-end" render={<Link href={action} />} type="button" variant="outline">Clear</Button>
    </form>
  );
}
