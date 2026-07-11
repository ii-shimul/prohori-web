import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { UnauthorizedState } from "@/components/shared/unauthorized-state";
import { SimulationView } from "@/components/simulation/simulation-view";
import { parsePreviewRole } from "@/lib/operations/preview-role";
import { parseSimulationState } from "@/lib/operations/simulation";

export default async function SimulationPreviewPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const params = await searchParams;
  const role = parsePreviewRole(params.role, "DEMO_ADMIN");
  const state = parseSimulationState(params);
  return <AppShell role={role} showSignOut={false}>{role === "DEMO_ADMIN" ? <SimulationView {...state} /> : <UnauthorizedState />}</AppShell>;
}
