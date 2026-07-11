import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { requireAuthenticatedUser } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireAuthenticatedUser();
  return <AppShell role="PROVIDER_OPERATIONS">{children}</AppShell>;
}
