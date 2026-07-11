import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftIcon, Link2Icon } from "lucide-react";

import { CaseStateBadge } from "@/components/cases/cases-view";
import { Card, CardContent } from "@/components/ui/card";
import type { CaseRecord } from "@/lib/operations/cases";

export function CaseDetailView({
  caseRecord,
  backHref,
  alertHref,
  outletHref,
  children,
}: {
  caseRecord: CaseRecord;
  backHref: string;
  alertHref: string;
  outletHref: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby="case-title" className="mx-auto max-w-6xl space-y-6">
      <header className="border-b border-border pb-5"><Link href={backHref} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><ArrowLeftIcon aria-hidden="true" className="size-4" />Back to Cases</Link><div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div className="min-w-0"><p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">Case Coordination</p><h1 id="case-title" className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{caseRecord.title}</h1><p className="mt-2 text-pretty text-muted-foreground">{caseRecord.outletName} · {caseRecord.provider.replace("_", " ")} · Owner: {caseRecord.owner}</p></div><CaseStateBadge state={caseRecord.state} /></div></header>
      <Card className="border border-border shadow-none"><CardContent className="flex flex-col gap-3 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between"><p className="font-medium">Case links remain provider-scoped.</p><div className="flex flex-wrap gap-4"><Link className="inline-flex items-center gap-1 text-primary hover:underline" href={alertHref}><Link2Icon aria-hidden="true" className="size-4" />Source Alert</Link><Link className="inline-flex items-center gap-1 text-primary hover:underline" href={outletHref}><Link2Icon aria-hidden="true" className="size-4" />Outlet Detail</Link></div></CardContent></Card>
      {children}
    </section>
  );
}
