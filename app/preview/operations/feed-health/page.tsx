import { notFound } from "next/navigation";

import { FeedHealthView } from "@/components/feed-health/feed-health-view";
import { AppShell } from "@/components/layout/app-shell";
import { UnauthorizedState } from "@/components/shared/unauthorized-state";
import { parseFeedHealthFilters } from "@/lib/operations/feed-health";
import { parsePreviewRole } from "@/lib/operations/preview-role";

export default async function FeedHealthPreviewPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const params = await searchParams;
  const role = parsePreviewRole(params.role, "DATA_STEWARD");
  return <AppShell role={role} showSignOut={false}>{role === "DATA_STEWARD" || role === "DEMO_ADMIN" ? <FeedHealthView filters={parseFeedHealthFilters(params)} /> : <UnauthorizedState />}</AppShell>;
}
