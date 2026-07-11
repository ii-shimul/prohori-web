import { notFound } from "next/navigation";

import { AlertDetailView } from "@/components/alerts/alert-detail-view";
import { getAlert } from "@/lib/operations/alerts";

export default async function PreviewAlertDetailPage({ params }: { params: Promise<{ alertId: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();

  const alert = await getAlert((await params).alertId);
  if (!alert) notFound();

  return <AlertDetailView alert={alert} backHref="/preview/operations/alerts" caseHref={alert.linkedCase ? `/preview/operations/cases/${alert.linkedCase.toLowerCase()}` : undefined} outletHref={`/preview/operations/outlets/${alert.outletId}`} />;
}
