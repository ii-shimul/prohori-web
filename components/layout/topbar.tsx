import { signOut } from "@/app/(dashboard)/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/locale";
import type { UserRole } from "@/types/auth";

import { LocaleSwitcher } from "./locale-switcher";

export function Topbar({ roles, locale, showSignOut = true }: { roles: readonly UserRole[]; locale: Locale; showSignOut?: boolean }) {
  const roleLabel = roles.length > 0 ? roles.map((role) => role.replaceAll("_", " ")).join(", ") : "NO API ROLE";

  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-border bg-background px-4 sm:px-6">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">Operations Workspace</p>
        <p className="truncate text-xs text-muted-foreground">Role-aware preview shell</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <LocaleSwitcher locale={locale} />
        <Badge variant="outline" className="max-w-52 truncate" title={roleLabel}>
          {roleLabel}
        </Badge>
        {showSignOut ? (
          <form action={signOut}>
            <Button size="sm" type="submit" variant="outline">
              Sign Out
            </Button>
          </form>
        ) : null}
      </div>
    </header>
  );
}
