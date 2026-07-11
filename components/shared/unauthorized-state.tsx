import Link from "next/link";
import { ShieldAlertIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UnauthorizedState() {
  return (
    <Card className="border border-border shadow-none" role="alert">
      <CardHeader>
        <ShieldAlertIcon aria-hidden="true" className="size-6 text-primary" />
        <CardTitle className="mt-2 text-balance">Access Restricted</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-pretty text-muted-foreground">
          Your current role cannot view this workspace. Return to Dashboard or use an authorized account.
        </p>
        <Link className="text-sm font-medium text-primary hover:underline" href="/dashboard">
          Return to Dashboard
        </Link>
      </CardContent>
    </Card>
  );
}
