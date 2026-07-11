import { BarChart3Icon, CircleAlertIcon, DatabaseZapIcon, ListChecksIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/formatters/dates";
import { getManagementReadiness } from "@/lib/operations/readiness";

export async function ReadinessView() {
  const readiness = await getManagementReadiness();
  const items = [
    { label: "Operational Coverage", value: readiness.operationalCoverage, icon: BarChart3Icon },
    { label: "Forecast Confidence", value: readiness.forecastConfidence, icon: DatabaseZapIcon },
    { label: "Open Review Queue", value: String(readiness.openReviewQueue), icon: ListChecksIcon },
    { label: "Critical Incidents", value: String(readiness.criticalIncidents), icon: CircleAlertIcon },
  ];

  return <section aria-labelledby="readiness-title" className="mx-auto max-w-6xl space-y-6"><header className="border-b border-border pb-5"><p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">Platform View</p><h1 id="readiness-title" className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Management Readiness</h1><p className="mt-2 max-w-3xl text-pretty text-muted-foreground">Aggregate readiness for authorized management review. This view does not reconstruct provider, outlet, customer, or competitor detail.</p></header><Card className="border border-border bg-muted/40 shadow-none"><CardHeader><CardTitle>Redaction Boundary</CardTitle><CardDescription>{readiness.note}</CardDescription></CardHeader></Card><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map((item) => { const Icon = item.icon; return <Card key={item.label} className="border border-border shadow-none"><CardHeader><Icon aria-hidden="true" className="size-5 text-primary" /><CardDescription className="mt-3">{item.label}</CardDescription><CardTitle className="text-balance text-lg">{item.value}</CardTitle></CardHeader></Card>; })}</div><Card className="border border-border shadow-none"><CardHeader><CardTitle>Data Quality Watch</CardTitle><CardDescription>Aggregate status: {readiness.dataQuality}</CardDescription></CardHeader><CardContent><p className="text-sm text-muted-foreground">As of <time dateTime={readiness.asOf} className="tabular-nums">{formatDateTime(readiness.asOf)}</time></p></CardContent></Card></section>;
}
