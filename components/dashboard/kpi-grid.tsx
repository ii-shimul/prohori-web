import { ActivityIcon, CircleAlertIcon, ListChecksIcon, RadioTowerIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type Kpis = {
  outletsUnderPressure: number;
  highAlerts: number;
  staleFeeds: number;
  openCases: number;
};

const kpiDefinitions = [
  { key: "outletsUnderPressure", label: "Outlets Under Pressure", icon: ActivityIcon, tone: "text-destructive" },
  { key: "highAlerts", label: "High Alerts", icon: CircleAlertIcon, tone: "text-destructive" },
  { key: "staleFeeds", label: "Stale Feeds", icon: RadioTowerIcon, tone: "text-primary" },
  { key: "openCases", label: "Open Cases", icon: ListChecksIcon, tone: "text-primary" },
] as const;

export function KpiGrid({ kpis }: { kpis: Kpis }) {
  return (
    <section aria-label="Operations summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {kpiDefinitions.map(({ key, label, icon: Icon, tone }) => (
        <Card key={key} className="border border-border shadow-none">
          <CardContent className="flex items-start justify-between gap-3 pt-4">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">{kpis[key]}</p>
            </div>
            <Icon aria-hidden="true" className={`size-5 shrink-0 ${tone}`} />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
