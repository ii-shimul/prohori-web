import type { ReactNode } from "react";

import { TriangleAlertIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ErrorState({
  title = "Could Not Load This View",
  description,
  correlationId,
  action,
}: {
  title?: string;
  description: string;
  correlationId?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="border border-destructive/30 shadow-none" role="alert">
      <CardHeader>
        <TriangleAlertIcon aria-hidden="true" className="size-6 text-destructive" />
        <CardTitle className="mt-2 text-balance">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-pretty text-muted-foreground">{description}</p>
        {correlationId ? (
          <p className="break-words text-xs text-muted-foreground">
            Reference: <span translate="no">{correlationId}</span>
          </p>
        ) : null}
        {action ? <div>{action}</div> : null}
      </CardContent>
    </Card>
  );
}
