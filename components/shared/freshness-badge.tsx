import { CircleAlertIcon, CircleCheckIcon, Clock3Icon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/messages";
import type { Freshness } from "@/lib/formatters/status";

const freshnessStyles: Record<Freshness, { className: string; icon: typeof CircleCheckIcon }> = {
  fresh: { className: "border-success/30 bg-success/10 text-success", icon: CircleCheckIcon },
  degraded: { className: "border-cta-gold/60 bg-cta-gold/20 text-primary", icon: CircleAlertIcon },
  stale: { className: "border-destructive/30 bg-destructive/10 text-destructive", icon: Clock3Icon },
};

export function FreshnessBadge({ freshness, locale = "en" }: { freshness: Freshness; locale?: Locale }) {
  const { className, icon: Icon } = freshnessStyles[freshness];

  return (
    <Badge variant="outline" className={className}>
      <Icon aria-hidden="true" className="size-3" />
      {t(locale, `status.${freshness}`)}
    </Badge>
  );
}
