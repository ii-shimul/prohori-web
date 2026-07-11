"use client";

import { use } from "react";
import { AlertDetailView } from "@/components/alerts/alert-detail-view";

export default function AlertDetailPage({ params }: { params: Promise<{ alertId: string }> }) {
  const { alertId } = use(params);

  return (
    <AlertDetailView
      alertId={alertId}
      backHref="/alerts"
      outletHref="" // Derived inside AlertDetailView
    />
  );
}
