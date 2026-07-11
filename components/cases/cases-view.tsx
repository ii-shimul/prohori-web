import Link from "next/link";
import { FolderKanbanIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLocale, type Locale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/messages";
import { getCases } from "@/lib/operations/cases";

const stateClass = { OPEN: "border-destructive/30 bg-destructive/10 text-destructive", ACKNOWLEDGED: "border-cta-gold/60 bg-cta-gold/20 text-primary", INVESTIGATING: "border-secondary/30 bg-secondary/10 text-primary", ESCALATED: "border-destructive/30 bg-destructive/10 text-destructive", RESOLVED: "border-success/30 bg-success/10 text-success", CLOSED: "border-border bg-muted text-muted-foreground" } as const;

export function CaseStateBadge({ state, locale = "en" }: { state: keyof typeof stateClass; locale?: Locale }) {
  return <Badge variant="outline" className={stateClass[state]}>{t(locale, `status.${state}`)}</Badge>;
}

export async function CasesView({ detailBasePath }: { detailBasePath: "/cases" | "/preview/operations/cases" }) {
  const [locale, cases] = await Promise.all([getLocale(), getCases(detailBasePath === "/preview/operations/cases" ? "fixture" : "api")]);
  if (cases.length === 0) return <EmptyState title="No Open Cases" description="New review cases will appear here when alerts require coordination." />;
  return <section aria-labelledby="cases-title" className="mx-auto max-w-6xl space-y-6"><header className="border-b border-border pb-5"><p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">{t(locale, "cases.queue")}</p><h1 id="cases-title" className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{t(locale, "cases.title")}</h1><p className="mt-2 max-w-3xl text-pretty text-muted-foreground">Track human review from acknowledgement through closure. Every action must leave an audit event.</p></header><div className="space-y-4">{cases.map((caseRecord) => <Card key={caseRecord.id} className="border border-border shadow-none transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-sm"><CardHeader><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex items-center gap-2"><FolderKanbanIcon aria-hidden="true" className="size-5 text-primary" /><CardTitle>{caseRecord.title}</CardTitle></div><CardDescription className="mt-2">{caseRecord.outletName} · Owner: {caseRecord.owner}</CardDescription></div><CaseStateBadge state={caseRecord.state} locale={locale} /></div></CardHeader><CardContent><Link className="text-sm font-medium text-primary hover:underline" href={`${detailBasePath}/${caseRecord.id}`}>{t(locale, "cases.open")}</Link></CardContent></Card>)}</div></section>;
}
