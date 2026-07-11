export type ManagementReadiness = {
  asOf: string;
  operationalCoverage: string;
  forecastConfidence: string;
  dataQuality: string;
  openReviewQueue: number;
  criticalIncidents: number;
  note: string;
};

const fixtureReadiness: ManagementReadiness = {
  asOf: "2026-07-11T09:35:00.000Z",
  operationalCoverage: "92% of authorized network reporting",
  forecastConfidence: "81% aggregate confidence; 1 critical-quality exclusion",
  dataQuality: "1 stale/conflicting source under verification",
  openReviewQueue: 4,
  criticalIncidents: 1,
  note: "Aggregate synthetic readiness only. No provider, outlet, customer, balance, or competitor detail is rendered.",
};

type ReadinessSource = "fixture" | "api";
type ApiReadiness = import("@/lib/api/generated").components["schemas"]["ManagementReadiness"];

export async function getManagementReadiness(source: ReadinessSource = "fixture"): Promise<ManagementReadiness> {
  if (source === "api") {
    const { apiRequest } = await import("@/lib/api/client");
    const { getVerifiedAccessToken } = await import("@/lib/auth/session");
    const accessToken = await getVerifiedAccessToken();
    if (!accessToken) throw new Error("Authenticated API read requires a verified Supabase access token.");
    const readiness = await apiRequest<ApiReadiness>("management/readiness", accessToken);
    return {
      asOf: readiness.generatedAt,
      operationalCoverage: `${readiness.providersReporting} providers reporting`,
      forecastConfidence: "Not provided by API",
      dataQuality: `${readiness.providersDegraded} degraded · ${readiness.providersUnreliable} unreliable providers`,
      openReviewQueue: readiness.unresolvedOutletCount,
      criticalIncidents: readiness.activeIncidentCount,
      note: "Aggregate API readiness only. Backend redaction boundary excludes provider, outlet, transaction, balance, and incident detail.",
    };
  }

  return fixtureReadiness;
}
