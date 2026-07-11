import type { ReactNode } from "react";

import type { UserRole } from "@/types/auth";

import { MobileNavigation, Sidebar } from "./sidebar";
import { SyntheticBanner } from "./synthetic-banner";
import { Topbar } from "./topbar";

export function AppShell({
  children,
  role,
  showSignOut = true,
}: {
  children: ReactNode;
  role: UserRole;
  showSignOut?: boolean;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--surface-1)]">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-background md:block">
        <Sidebar role={role} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar role={role} showSignOut={showSignOut} />
        <div className="border-b border-border bg-background md:hidden">
          <MobileNavigation role={role} />
        </div>
        <SyntheticBanner />
        <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
