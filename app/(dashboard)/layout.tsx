import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { requireAuthenticatedUser } from "@/lib/auth/guards";
import { getDashboardRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireAuthenticatedUser();
  return <AppShell role={await getDashboardRole()}>{children}</AppShell>;
}
