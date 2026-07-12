import { notFound } from "next/navigation";

import { OperationsView } from "@/components/dashboard/operations-view";
import { AppShell } from "@/components/layout/app-shell";
import { parseOutletFilters } from "@/lib/operations/outlets";

export default async function OperationsPreviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <AppShell role="PROVIDER_OPERATIONS" showSignOut={false}>
      <OperationsView variant="dashboard" />
    </AppShell>
  );
}
