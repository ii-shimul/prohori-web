import { notFound } from "next/navigation";

import { CaseDetailView } from "@/components/cases/case-detail-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCase } from "@/lib/operations/cases";

export default async function CaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const caseRecord = await getCase((await params).caseId);
  if (!caseRecord) notFound();

  return <CaseDetailView caseRecord={caseRecord} backHref="/cases" alertHref={`/alerts/${caseRecord.alertId}`} outletHref={`/outlets/${caseRecord.outletId}`}><Card className="border border-border shadow-none"><CardHeader><CardTitle>Workflow Commands Await API</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Live case commands require API idempotency, optimistic version checks, and audit writes. Use development preview to test fixture workflow.</CardContent></Card></CaseDetailView>;
}
