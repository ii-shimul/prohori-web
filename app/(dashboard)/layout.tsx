import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { requireApiCurrentUser } from "@/lib/auth/current-user";
import { getApiRoles } from "@/lib/auth/api-roles";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireApiCurrentUser();
  return <AppShell roles={getApiRoles(user)}>{children}</AppShell>;
}
