"use client";

import { use, useEffect, useState } from "react";
import { CaseDetailView } from "@/components/cases/case-detail-view";
import { CaseWorkflow } from "@/components/cases/case-workflow";
import { minimalApiRequest } from "@/lib/api/minimal-client";
import { PageLoading } from "@/components/shared/page-loading";
import { ErrorState } from "@/components/shared/error-state";
import type { CaseRecord } from "@/lib/operations/cases";

export default function CaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function loadCaseDetail() {
      try {
        setLoading(true);
        setError(null);

        const [rawCase, timeline, rawOutlets, rawProviders] = await Promise.all([
          minimalApiRequest<any>(`cases/${caseId}`),
          minimalApiRequest<any>(`cases/${caseId}/timeline`),
          minimalApiRequest<any[]>("outlets"),
          minimalApiRequest<any[]>("providers"),
        ]);

        const providerById = new Map(rawProviders.map((p) => [p.id, p.code]));
        const outletById = new Map(rawOutlets.map((o) => [o.id, o]));

        const outlet = outletById.get(rawCase.outletId);
        const provider = providerById.get(rawCase.providerId) || "SHARED";
        const outletName = outlet?.name || `Outlet ${rawCase.outletId.slice(0, 8)}`;
        const title = `${outletName} — ${rawCase.state.charAt(0) + rawCase.state.slice(1).toLowerCase()} case`;
        const owner = rawCase.ownerUserId ? `User ${rawCase.ownerUserId.slice(0, 8)}…` : "Unassigned";

        let alertId: string | null = null;
        if (timeline.events) {
          for (const event of timeline.events) {
            if (event?.metadata?.alertId) {
              alertId = event.metadata.alertId;
              break;
            }
          }
        }

        const notes = timeline.notes?.map((n: any) => ({
          id: n.id,
          at: n.createdAt,
          author: n.authorUserId,
          body: n.body,
        })) || [];

        const events = [...(timeline.events || []), ...(timeline.auditEvents || [])];
        const mappedTimeline = events
          .map((e: any) => ({
            id: e.id,
            at: e.wallAt || e.createdAt,
            actor: e.actorUserId || e.actorType || "System",
            action: e.eventType || e.action || "Event",
            from: e.oldState || null,
            to: e.newState || null,
            summary: e.eventType || e.action || "Status change",
            correlationId: e.correlationId || "—",
          }))
          .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

        setCaseRecord({
          id: rawCase.id,
          title,
          provider,
          outletId: rawCase.outletId,
          outletName,
          severity: null,
          alertId,
          state: rawCase.state,
          version: rawCase.version || 1,
          owner,
          notes,
          timeline: mappedTimeline,
        });

        setLoading(false);
      } catch (err: any) {
        console.error("Failed to load case detail", err);
        setError(err.message || "Failed to load case detail.");
        setLoading(false);
      }
    }

    loadCaseDetail();
  }, [caseId, refreshTrigger]);

  if (loading) return <PageLoading />;
  if (error || !caseRecord) return <ErrorState description={error || "Case not found"} correlationId="case-detail-load-error" />;

  return (
    <CaseDetailView
      caseRecord={caseRecord}
      backHref="/cases"
      alertHref={caseRecord.alertId ? `/alerts/${caseRecord.alertId}` : "/alerts"}
      outletHref={`/outlets/${caseRecord.outletId}`}
    >
      <CaseWorkflow caseRecord={caseRecord} onWorkflowComplete={() => setRefreshTrigger((prev) => prev + 1)} />
    </CaseDetailView>
  );
}
