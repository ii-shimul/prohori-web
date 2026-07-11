import { notFound } from "next/navigation";

import { CaseDetailView } from "@/components/cases/case-detail-view";
import { CaseWorkflowPreview } from "@/components/cases/case-workflow-preview";
import { getCase } from "@/lib/operations/cases";

export default async function PreviewCaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const caseRecord = await getCase((await params).caseId);
  if (!caseRecord) notFound();

  return <CaseDetailView caseRecord={caseRecord} backHref="/preview/operations/cases" alertHref={`/preview/operations/alerts/${caseRecord.alertId}`} outletHref={`/preview/operations/outlets/${caseRecord.outletId}`}><CaseWorkflowPreview caseRecord={caseRecord} /></CaseDetailView>;
}
