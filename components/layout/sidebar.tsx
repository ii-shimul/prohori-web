import Link from "next/link";
import {
  ActivityIcon,
  Building2Icon,
  GaugeIcon,
  ListChecksIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
} from "lucide-react";

import type { UserRole } from "@/types/auth";

type NavigationItem = {
  href: string;
  label: string;
  icon: typeof GaugeIcon;
  roles: readonly UserRole[];
};

const allDashboardRoles: readonly UserRole[] = [
  "PROVIDER_OPERATIONS",
  "PLATFORM_MANAGEMENT",
  "DATA_STEWARD",
  "VALIDATION_AUDITOR",
  "DEMO_ADMIN",
];

const navigationItems: readonly NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: GaugeIcon, roles: allDashboardRoles },
  { href: "/outlets", label: "Outlets", icon: Building2Icon, roles: allDashboardRoles },
  { href: "/alerts", label: "Alerts", icon: ActivityIcon, roles: allDashboardRoles },
  { href: "/cases", label: "Cases", icon: ListChecksIcon, roles: allDashboardRoles },
  { href: "/feed-health", label: "Feed Health", icon: ShieldCheckIcon, roles: ["DATA_STEWARD", "DEMO_ADMIN"] },
  { href: "/management/readiness", label: "Management", icon: ShieldCheckIcon, roles: ["PLATFORM_MANAGEMENT", "DEMO_ADMIN"] },
  { href: "/simulation", label: "Simulation", icon: SlidersHorizontalIcon, roles: ["DEMO_ADMIN"] },
  { href: "/settings", label: "Settings", icon: SettingsIcon, roles: allDashboardRoles },
];

function visibleItems(role: UserRole) {
  return navigationItems.filter((item) => item.roles.includes(role));
}

export function Sidebar({ role }: { role: UserRole }) {
  return (
    <nav aria-label="Primary navigation" className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-5">
        <p className="text-lg font-semibold tracking-tight text-primary">Prohori</p>
        <p className="mt-1 text-xs text-muted-foreground">Operations Hub</p>
      </div>
      <div className="flex-1 space-y-1 p-3">
        {visibleItems(role).map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground no-underline transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Icon aria-hidden="true" className="size-4 text-primary" />
              <span className="min-w-0 truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileNavigation({ role }: { role: UserRole }) {
  return (
    <nav aria-label="Primary navigation" className="flex gap-1 overflow-x-auto px-3 py-2">
      {visibleItems(role).map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground no-underline transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Icon aria-hidden="true" className="size-4 text-primary" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
