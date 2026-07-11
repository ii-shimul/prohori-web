import { CircleAlertIcon, CircleCheckIcon, Clock3Icon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatFreshness, type Freshness } from "@/lib/formatters/status";

const freshnessStyles: Record<Freshness, { className: string; icon: typeof CircleCheckIcon }> = {
  fresh: { className: "border-success/30 bg-success/10 text-success", icon: CircleCheckIcon },
  degraded: { className: "border-cta-gold/60 bg-cta-gold/20 text-primary", icon: CircleAlertIcon },
  stale: { className: "border-destructive/30 bg-destructive/10 text-destructive", icon: Clock3Icon },
};

export function FreshnessBadge({ freshness }: { freshness: Freshness }) {
  const { className, icon: Icon } = freshnessStyles[freshness];

  return (
    <Badge variant="outline" className={className}>
      <Icon aria-hidden="true" className="size-3" />
      {formatFreshness(freshness)}
    </Badge>
  );
}
