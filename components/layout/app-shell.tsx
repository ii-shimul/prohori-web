import type { ReactNode } from "react";

import type { UserRole } from "@/types/auth";
import { getLocale } from "@/lib/i18n/locale";

import { MobileNavigation, Sidebar } from "./sidebar";
import { SyntheticBanner } from "./synthetic-banner";
import { Topbar } from "./topbar";

export async function AppShell({
  children,
  role,
  roles,
  showSignOut = true,
}: {
  children: ReactNode;
  role?: UserRole;
  roles?: readonly UserRole[];
  showSignOut?: boolean;
}) {
  const effectiveRoles = roles ?? (role ? [role] : []);
  const locale = await getLocale();
  return (
    <div className="flex min-h-screen bg-[var(--surface-1)]">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-background md:block">
        <Sidebar roles={effectiveRoles} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar roles={effectiveRoles} locale={locale} showSignOut={showSignOut} />
        <div className="border-b border-border bg-background md:hidden">
          <MobileNavigation roles={effectiveRoles} />
        </div>
        <SyntheticBanner />
        <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
