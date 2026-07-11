import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { getApiRoles } from "@/lib/auth/api-roles";
import { requireApiCurrentUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireApiCurrentUser();
  const apiRoles = getApiRoles(user);
  return <AppShell roles={apiRoles}>{children}</AppShell>;
}
