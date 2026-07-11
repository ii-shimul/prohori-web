import { OperationsView } from "@/components/dashboard/operations-view";
import { parseOutletFilters } from "@/lib/operations/outlets";

export default async function OutletsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <OperationsView filters={parseOutletFilters(await searchParams)} variant="outlets" />;
}
