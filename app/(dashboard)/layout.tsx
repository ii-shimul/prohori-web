"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { supabase } from "@/lib/supabase/minimal-client";
import { minimalApiRequest } from "@/lib/api/minimal-client";
import type { UserRole } from "@/types/auth";

const fallbackRoles: readonly UserRole[] = ["OUTLET_AGENT"];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<readonly UserRole[]>([]);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/login");
          return;
        }

        const me = await minimalApiRequest<{
          memberships: { role: UserRole }[];
          assignments: { role: UserRole }[];
        }>("me");

        if (active) {
          const grantedRoles = new Set<UserRole>([
            ...me.memberships.map((m) => m.role),
            ...me.assignments.map((a) => a.role),
          ]);
          const rolePriority: readonly UserRole[] = [
            "DEMO_ADMIN",
            "PLATFORM_MANAGEMENT",
            "DATA_STEWARD",
            "VALIDATION_AUDITOR",
            "PROVIDER_OPERATIONS",
            "OUTLET_AGENT",
          ];
          setRoles(rolePriority.filter((r) => grantedRoles.has(r)));
          setLoading(false);
        }
      } catch (err) {
        console.warn("Dashboard auth probe failed; falling back to demo roles.", err);
        if (active) {
          setRoles(fallbackRoles);
          setLoading(false);
        }
      }
    }

    checkAuth();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--surface-1)]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <AppShell roles={roles}>{children}</AppShell>;
}
