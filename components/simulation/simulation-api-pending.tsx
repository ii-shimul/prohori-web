import { CircleAlertIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SimulationApiPending() {
  return <Card className="mx-auto max-w-3xl border border-border shadow-none" role="alert"><CardHeader><CircleAlertIcon aria-hidden="true" className="size-6 text-primary" /><CardTitle className="mt-2 text-balance">Scenario API Contract Pending</CardTitle></CardHeader><CardContent><p className="text-pretty text-muted-foreground">Live scenario controls stay unavailable until API owner supplies authorized reset/start/step endpoints, response examples, role behavior, and deterministic fixture guarantees. Use development preview for UI-only validation.</p></CardContent></Card>;
}
