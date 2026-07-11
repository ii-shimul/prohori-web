import type { components } from "@/lib/api/generated";
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
  provider: Provider | "SHARED";
  outletId: string;
  outletName: string;
  severity: Severity | null;
  alertId: string | null;
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

type CaseSource = "fixture" | "api";
type ApiCase = components["schemas"]["Case"];
type ApiTimeline = components["schemas"]["CaseTimeline"];
type ApiOutlet = components["schemas"]["Outlet"];
type ApiProvider = components["schemas"]["Provider"];

export async function getCases(source: CaseSource = "fixture"): Promise<CaseRecord[]> {
  if (source === "api") {
    const { apiRequest } = await import("@/lib/api/client");
    const accessToken = await requireAccessToken();
    const [cases, outlets, providers] = await Promise.all([
      apiRequest<readonly ApiCase[]>("cases", accessToken),
      apiRequest<readonly ApiOutlet[]>("outlets", accessToken),
      apiRequest<readonly ApiProvider[]>("providers", accessToken),
    ]);
    return cases.map((caseRecord) => toCaseRecord(caseRecord, outlets, providers));
  }

  return fixtureCases.filter((caseRecord) => caseRecord.provider === currentProviderScope);
}

export async function getCase(caseId: string, source: CaseSource = "fixture"): Promise<CaseRecord | null> {
  if (source === "api") {
    const { apiRequest } = await import("@/lib/api/client");
    const accessToken = await requireAccessToken();
    try {
      const [caseRecord, timeline, outlets, providers] = await Promise.all([
        apiRequest<ApiCase>(`cases/${encodeURIComponent(caseId)}`, accessToken),
        apiRequest<ApiTimeline>(`cases/${encodeURIComponent(caseId)}/timeline`, accessToken),
        apiRequest<readonly ApiOutlet[]>("outlets", accessToken),
        apiRequest<readonly ApiProvider[]>("providers", accessToken),
      ]);
      return toCaseRecord(caseRecord, outlets, providers, timeline);
    } catch (error) {
      if (error instanceof Error && "status" in error && error.status === 404) return null;
      throw error;
    }
  }

  return fixtureCases.find((caseRecord) => caseRecord.id === caseId && caseRecord.provider === currentProviderScope) ?? null;
}

function toCaseRecord(caseRecord: ApiCase, outlets: readonly ApiOutlet[], providers: readonly ApiProvider[], timeline?: ApiTimeline): CaseRecord {
  const outlet = outlets.find((item) => item.id === caseRecord.outletId);
  const provider = providers.find((item) => item.id === caseRecord.providerId)?.code ?? "SHARED";
  return {
    id: caseRecord.id,
    title: `Case ${caseRecord.id}`,
    provider,
    outletId: caseRecord.outletId,
    outletName: outlet?.name ?? `Outlet ${caseRecord.outletId}`,
    severity: null,
    alertId: null,
    state: caseRecord.state,
    owner: caseRecord.ownerUserId ?? "Owner not provided by API",
    notes: timeline?.notes.map((note) => ({
      id: stringValue(note.id),
      at: stringValue(note.createdAt),
      author: stringValue(note.authorUserId),
      body: stringValue(note.body),
    })) ?? [],
    timeline: timeline ? toTimeline(timeline) : [],
  };
}

function toTimeline(timeline: ApiTimeline): CaseTimelineEvent[] {
  const events = [...timeline.events, ...timeline.auditEvents];
  return events.map((event) => ({
    id: stringValue(event.id),
    at: stringValue(event.wallAt),
    actor: stringValue(event.actorUserId ?? event.actorType),
    action: stringValue(event.eventType ?? event.action),
    from: toCaseState(event.oldState),
    to: toCaseState(event.newState),
    summary: stringValue(event.eventType ?? event.action),
    correlationId: stringValue(event.correlationId),
  })).sort((left, right) => left.at.localeCompare(right.at));
}

function toCaseState(value: unknown): CaseState | null {
  return typeof value === "string" && ["OPEN", "ACKNOWLEDGED", "INVESTIGATING", "ESCALATED", "RESOLVED", "CLOSED"].includes(value) ? value as CaseState : null;
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "Not provided by API";
}

async function requireAccessToken(): Promise<string> {
  const { getVerifiedAccessToken } = await import("@/lib/auth/session");
  const token = await getVerifiedAccessToken();
  if (!token) throw new Error("Authenticated API read requires a verified Supabase access token.");
  return token;
}
