import { signOut } from "@/app/(dashboard)/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/auth";

export function Topbar({ role, showSignOut = true }: { role: UserRole; showSignOut?: boolean }) {
  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-border bg-background px-4 sm:px-6">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">Operations Workspace</p>
        <p className="truncate text-xs text-muted-foreground">Role-aware preview shell</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="outline" className="max-w-52 truncate" title={role}>
          {role.replaceAll("_", " ")}
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
