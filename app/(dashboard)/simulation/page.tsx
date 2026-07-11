import { UnauthorizedState } from "@/components/shared/unauthorized-state";
import { SimulationView } from "@/components/simulation/simulation-view";
import { canViewDashboardRoute } from "@/lib/auth/roles";
import { parseSimulationState } from "@/lib/operations/simulation";

export default async function SimulationPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!(await canViewDashboardRoute(["DEMO_ADMIN"]))) return <UnauthorizedState />;
  const params = await searchParams;
  const state = parseSimulationState(params);
  return <SimulationView {...state} />;
}
