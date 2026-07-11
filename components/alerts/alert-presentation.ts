import { ActivityIcon, DatabaseZapIcon, GaugeIcon, Layers3Icon } from "lucide-react";

export const alertPresentation = {
  LIQUIDITY_PRESSURE: { label: "Liquidity Pressure", icon: GaugeIcon },
  UNUSUAL_ACTIVITY: { label: "Unusual Activity Requires Review", icon: ActivityIcon },
  DATA_INCONSISTENCY: { label: "Data Inconsistency", icon: DatabaseZapIcon },
  COMBINED_REVIEW: { label: "Combined Review", icon: Layers3Icon },
} as const;

export const severityClass = { HIGH: "border-destructive/30 bg-destructive/10 text-destructive", MEDIUM: "border-cta-gold/60 bg-cta-gold/20 text-primary", LOW: "border-success/30 bg-success/10 text-success" } as const;
export const qualityClass = { good: "border-success/30 bg-success/10 text-success", degraded: "border-cta-gold/60 bg-cta-gold/20 text-primary", critical: "border-destructive/30 bg-destructive/10 text-destructive" } as const;
