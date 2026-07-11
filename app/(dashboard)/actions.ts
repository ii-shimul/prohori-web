"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { apiRequest } from "@/lib/api/client";
import { requireAuth } from "@/lib/auth/guards";
import { getVerifiedAccessToken } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  await requireAuth();
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

async function getAccessToken() {
  await requireAuth();
  const token = await getVerifiedAccessToken();
  if (!token) throw new Error("Access token missing");
  return token;
}

export async function acknowledgeAlert(alertId: string) {
  const token = await getAccessToken();
  const idempotencyKey = crypto.randomUUID();
  await apiRequest(`alerts/${encodeURIComponent(alertId)}/acknowledge`, token, {
    method: "POST",
    idempotencyKey,
  });
  revalidatePath("/alerts");
  revalidatePath(`/alerts/${alertId}`);
}

export async function assignAlert(alertId: string, assigneeUserId: string) {
  const token = await getAccessToken();
  const idempotencyKey = crypto.randomUUID();
  await apiRequest(`alerts/${encodeURIComponent(alertId)}/assign`, token, {
    method: "POST",
    idempotencyKey,
    body: JSON.stringify({ assigneeUserId }),
  });
  revalidatePath("/alerts");
  revalidatePath(`/alerts/${alertId}`);
}

export async function createAlertCase(alertId: string) {
  const token = await getAccessToken();
  const idempotencyKey = crypto.randomUUID();
  const correlationId = crypto.randomUUID();
  const res = await apiRequest<{ case: { id: string } }>(`alerts/${encodeURIComponent(alertId)}/create-case`, token, {
    method: "POST",
    idempotencyKey,
    correlationId,
  });
  revalidatePath("/alerts");
  revalidatePath(`/alerts/${alertId}`);
  revalidatePath("/cases");
  if (res?.case?.id) {
    redirect(`/cases/${res.case.id}`);
  }
}

export async function acknowledgeCase(caseId: string, version: number) {
  const token = await getAccessToken();
  const idempotencyKey = crypto.randomUUID();
  const correlationId = crypto.randomUUID();
  await apiRequest(`cases/${encodeURIComponent(caseId)}/acknowledge`, token, {
    method: "POST",
    idempotencyKey,
    correlationId,
    body: JSON.stringify({ version }),
  });
  revalidatePath("/cases");
  revalidatePath(`/cases/${caseId}`);
}

export async function assignCase(caseId: string, version: number, assigneeUserId: string) {
  const token = await getAccessToken();
  const idempotencyKey = crypto.randomUUID();
  const correlationId = crypto.randomUUID();
  await apiRequest(`cases/${encodeURIComponent(caseId)}/assign`, token, {
    method: "POST",
    idempotencyKey,
    correlationId,
    body: JSON.stringify({ version, assigneeUserId }),
  });
  revalidatePath("/cases");
  revalidatePath(`/cases/${caseId}`);
}

export async function addCaseNote(caseId: string, version: number, body: string) {
  const token = await getAccessToken();
  const idempotencyKey = crypto.randomUUID();
  const correlationId = crypto.randomUUID();
  await apiRequest(`cases/${encodeURIComponent(caseId)}/notes`, token, {
    method: "POST",
    idempotencyKey,
    correlationId,
    body: JSON.stringify({ version, body }),
  });
  revalidatePath("/cases");
  revalidatePath(`/cases/${caseId}`);
}

export async function requestCaseVerification(caseId: string, version: number, summary: string) {
  const token = await getAccessToken();
  const idempotencyKey = crypto.randomUUID();
  const correlationId = crypto.randomUUID();
  await apiRequest(`cases/${encodeURIComponent(caseId)}/request-verification`, token, {
    method: "POST",
    idempotencyKey,
    correlationId,
    body: JSON.stringify({ version, summary }),
  });
  revalidatePath("/cases");
  revalidatePath(`/cases/${caseId}`);
}

export async function escalateCase(caseId: string, version: number) {
  const token = await getAccessToken();
  const idempotencyKey = crypto.randomUUID();
  const correlationId = crypto.randomUUID();
  await apiRequest(`cases/${encodeURIComponent(caseId)}/escalate`, token, {
    method: "POST",
    idempotencyKey,
    correlationId,
    body: JSON.stringify({ version }),
  });
  revalidatePath("/cases");
  revalidatePath(`/cases/${caseId}`);
}

export async function recordCaseDisposition(caseId: string, version: number, disposition: string) {
  const token = await getAccessToken();
  const idempotencyKey = crypto.randomUUID();
  const correlationId = crypto.randomUUID();
  await apiRequest(`cases/${encodeURIComponent(caseId)}/disposition`, token, {
    method: "POST",
    idempotencyKey,
    correlationId,
    body: JSON.stringify({ version, disposition }),
  });
  revalidatePath("/cases");
  revalidatePath(`/cases/${caseId}`);
}

export async function resolveCase(caseId: string, version: number, resolutionCode: string, resolutionSummary: string) {
  const token = await getAccessToken();
  const idempotencyKey = crypto.randomUUID();
  const correlationId = crypto.randomUUID();
  await apiRequest(`cases/${encodeURIComponent(caseId)}/resolve`, token, {
    method: "POST",
    idempotencyKey,
    correlationId,
    body: JSON.stringify({ version, resolutionCode, resolutionSummary }),
  });
  revalidatePath("/cases");
  revalidatePath(`/cases/${caseId}`);
}

export async function closeCase(caseId: string, version: number) {
  const token = await getAccessToken();
  const idempotencyKey = crypto.randomUUID();
  const correlationId = crypto.randomUUID();
  await apiRequest(`cases/${encodeURIComponent(caseId)}/close`, token, {
    method: "POST",
    idempotencyKey,
    correlationId,
    body: JSON.stringify({ version }),
  });
  revalidatePath("/cases");
  revalidatePath(`/cases/${caseId}`);
}

export async function reopenCase(caseId: string, version: number) {
  const token = await getAccessToken();
  const idempotencyKey = crypto.randomUUID();
  const correlationId = crypto.randomUUID();
  await apiRequest(`cases/${encodeURIComponent(caseId)}/reopen`, token, {
    method: "POST",
    idempotencyKey,
    correlationId,
    body: JSON.stringify({ version }),
  });
  revalidatePath("/cases");
  revalidatePath(`/cases/${caseId}`);
}

export async function startSimulation(scenario: "A" | "B" | "C" | "D") {
  const token = await getAccessToken();
  await apiRequest("simulation/start", token, {
    method: "POST",
    body: JSON.stringify({ scenario }),
  });
  revalidatePath("/dashboard");
  revalidatePath("/outlets");
  revalidatePath("/alerts");
  revalidatePath("/cases");
  revalidatePath("/feed-health");
  revalidatePath("/management/readiness");
  revalidatePath("/simulation");
}

export async function stepSimulation(scenario: "A" | "B" | "C" | "D") {
  const token = await getAccessToken();
  await apiRequest("simulation/step", token, {
    method: "POST",
    body: JSON.stringify({ scenario }),
  });
  revalidatePath("/dashboard");
  revalidatePath("/outlets");
  revalidatePath("/alerts");
  revalidatePath("/cases");
  revalidatePath("/feed-health");
  revalidatePath("/management/readiness");
  revalidatePath("/simulation");
}

export async function resetSimulation() {
  const token = await getAccessToken();
  await apiRequest("simulation/reset", token, {
    method: "POST",
  });
  revalidatePath("/dashboard");
  revalidatePath("/outlets");
  revalidatePath("/alerts");
  revalidatePath("/cases");
  revalidatePath("/feed-health");
  revalidatePath("/management/readiness");
  revalidatePath("/simulation");
}

