"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorState
      description={error.message || "Refresh this workspace. If problem continues, share reference details with support."}
      action={<Button onClick={reset}>Try Again</Button>}
    />
  );
}
