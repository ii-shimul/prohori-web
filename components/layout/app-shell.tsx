"use client";

import { ReactNode, useEffect, useState } from "react";
import type { UserRole } from "@/types/auth";
import type { Locale } from "@/lib/i18n/locale";

import { MobileNavigation, Sidebar } from "./sidebar";
import { SyntheticBanner } from "./synthetic-banner";
import { Topbar } from "./topbar";

export function AppShell({
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
  const [locale, setLocale] = useState<Locale>("en");
  
  useEffect(() => {
    // Read locale from cookie client-side
    const match = document.cookie.match(/prohori_locale=(bn|en)/);
    if (match?.[1]) {
      setLocale(match[1] as Locale);
    }
  }, []);

  const effectiveRoles = roles ?? (role ? [role] : []);

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
