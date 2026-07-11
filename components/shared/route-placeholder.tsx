import { FreshnessBadge } from "@/components/shared/freshness-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function RoutePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section aria-labelledby="page-title" className="mx-auto max-w-6xl space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">
          Phase 0.2 Preview
        </p>
        <h1 id="page-title" className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-2xl text-pretty text-muted-foreground">{description}</p>
      </header>
      <Card className="border border-border shadow-none">
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
          <CardDescription>
            API contract handoff pending. This page intentionally contains no fabricated domain data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <FreshnessBadge freshness="degraded" />
          <p className="text-sm text-muted-foreground">Showing shell and reusable-state preview.</p>
        </CardContent>
      </Card>
    </section>
  );
}
