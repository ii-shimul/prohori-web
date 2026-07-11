import { AlertsView } from "@/components/alerts/alerts-view";
import { parseAlertFilters } from "@/lib/operations/alerts";

export default async function AlertsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <AlertsView action="/alerts" filters={parseAlertFilters(await searchParams)} />;
}
