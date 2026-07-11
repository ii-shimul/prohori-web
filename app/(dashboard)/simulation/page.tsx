import { UnauthorizedState } from "@/components/shared/unauthorized-state";
import { SimulationApiPending } from "@/components/simulation/simulation-api-pending";
import { canViewDashboardRoute } from "@/lib/auth/roles";

export default async function SimulationPage() {
  if (!(await canViewDashboardRoute(["DEMO_ADMIN"]))) return <UnauthorizedState />;
  return <SimulationApiPending />;
}
