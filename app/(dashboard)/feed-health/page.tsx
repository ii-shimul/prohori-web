import { UnauthorizedState } from "@/components/shared/unauthorized-state";
import { FeedHealthView } from "@/components/feed-health/feed-health-view";
import { canViewDashboardRoute } from "@/lib/auth/roles";
import { parseFeedHealthFilters } from "@/lib/operations/feed-health";

export default async function FeedHealthPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!(await canViewDashboardRoute(["DATA_STEWARD", "DEMO_ADMIN"]))) return <UnauthorizedState />;
  return <FeedHealthView filters={parseFeedHealthFilters(await searchParams)} />;
}
