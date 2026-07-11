import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { ReadinessView } from "@/components/management/readiness-view";
import { UnauthorizedState } from "@/components/shared/unauthorized-state";
import { parsePreviewRole } from "@/lib/operations/preview-role";

export default async function ReadinessPreviewPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const role = parsePreviewRole((await searchParams).role, "PLATFORM_MANAGEMENT");
  return <AppShell role={role} showSignOut={false}>{role === "PLATFORM_MANAGEMENT" || role === "DEMO_ADMIN" ? <ReadinessView /> : <UnauthorizedState />}</AppShell>;
}
