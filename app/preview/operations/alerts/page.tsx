import { notFound } from "next/navigation";

import { AlertsView } from "@/components/alerts/alerts-view";
import { parseAlertFilters } from "@/lib/operations/alerts";

export default async function PreviewAlertsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.NODE_ENV !== "development") notFound();

  return <AlertsView action="/preview/operations/alerts" filters={parseAlertFilters(await searchParams)} />;
}
