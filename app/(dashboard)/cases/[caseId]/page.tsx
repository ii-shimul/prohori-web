import { notFound } from "next/navigation";

import { CaseDetailView } from "@/components/cases/case-detail-view";
import { CaseWorkflow } from "@/components/cases/case-workflow";
import { getCase } from "@/lib/operations/cases";

export default async function CaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const caseRecord = await getCase((await params).caseId, "api");
  if (!caseRecord) notFound();

  return (
    <CaseDetailView
      caseRecord={caseRecord}
      backHref="/cases"
      alertHref={caseRecord.alertId ? `/alerts/${caseRecord.alertId}` : "/alerts"}
      outletHref={`/outlets/${caseRecord.outletId}`}
    >
      <CaseWorkflow caseRecord={caseRecord} />
    </CaseDetailView>
  );
}
