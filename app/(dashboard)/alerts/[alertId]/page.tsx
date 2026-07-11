import { notFound } from "next/navigation";

import { AlertDetailView } from "@/components/alerts/alert-detail-view";
import { getAlert } from "@/lib/operations/alerts";

export default async function AlertDetailPage({ params }: { params: Promise<{ alertId: string }> }) {
  const alert = await getAlert((await params).alertId);
  if (!alert) notFound();

  return <AlertDetailView alert={alert} backHref="/alerts" caseHref={alert.linkedCase ? `/cases/${alert.linkedCase.toLowerCase()}` : undefined} outletHref={`/outlets/${alert.outletId}`} />;
}
