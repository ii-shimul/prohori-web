import { UnauthorizedState } from "@/components/shared/unauthorized-state";
import { ReadinessView } from "@/components/management/readiness-view";
import { canViewDashboardRoute } from "@/lib/auth/roles";

export default async function ReadinessPage() {
  if (!(await canViewDashboardRoute(["PLATFORM_MANAGEMENT", "DEMO_ADMIN"]))) return <UnauthorizedState />;
  return <ReadinessView source="api" />;
}
