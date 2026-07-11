import type { ReactNode } from "react";

import { InboxIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="items-center text-center">
        <InboxIcon aria-hidden="true" className="size-7 text-muted-foreground" />
        <CardTitle className="mt-2 text-balance">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="mx-auto max-w-lg text-pretty text-muted-foreground">{description}</p>
        {action ? <div className="flex justify-center">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
