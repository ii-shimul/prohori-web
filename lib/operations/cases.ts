import type { CaseState, Provider, Severity } from "@/types/domain";

export type CaseTimelineEvent = {
  id: string;
  at: string;
  actor: string;
  action: string;
  from: CaseState | null;
  to: CaseState | null;
  summary: string;
  correlationId: string;
};

export type CaseRecord = {
  id: string;
  title: string;
  provider: Provider;
  outletId: string;
  outletName: string;
  severity: Severity;
  alertId: string;
  state: CaseState;
  owner: string;
  notes: { id: string; at: string; author: string; body: string }[];
  timeline: CaseTimelineEvent[];
};

const currentProviderScope: Provider = "PROVIDER_A";

const fixtureCases: readonly CaseRecord[] = [
  {
    id: "case-204",
    title: "Provider A liquidity pressure requires review",
    provider: "PROVIDER_A",
    outletId: "dha-017",
    outletName: "Dhanmondi 27 Agent Point",
    severity: "HIGH",
    alertId: "alert-b-review",
    state: "OPEN",
    owner: "Unassigned",
    notes: [],
    timeline: [
      {
        id: "audit-204-001",
        at: "2026-07-11T09:33:00.000Z",
        actor: "System",
        action: "Case created",
        from: null,
        to: "OPEN",
        summary: "Combined review alert linked to case.",
        correlationId: "fixture-case-204-001",
      },
    ],
  },
];

export async function getCases(): Promise<CaseRecord[]> {
  return fixtureCases.filter((caseRecord) => caseRecord.provider === currentProviderScope);
}

export async function getCase(caseId: string): Promise<CaseRecord | null> {
  return fixtureCases.find((caseRecord) => caseRecord.id === caseId && caseRecord.provider === currentProviderScope) ?? null;
}
