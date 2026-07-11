"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      description="Refresh this workspace. If problem continues, share reference details with support."
      action={<Button onClick={reset}>Try Again</Button>}
    />
  );
}
