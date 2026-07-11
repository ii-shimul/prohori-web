"use client";

import { Button } from "@/components/ui/button";

import { ErrorState } from "./error-state";

export function RouteError({ reset }: { reset: () => void }) {
  return <ErrorState description="Refresh this view. If problem continues, share reference details with support." action={<Button onClick={reset}>Try Again</Button>} />;
}
