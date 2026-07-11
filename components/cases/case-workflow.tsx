"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2Icon,
  CircleDotDashedIcon,
  ClipboardCheckIcon,
  MessageSquareTextIcon,
  ShieldAlertIcon,
  UserPlusIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  acknowledgeCase,
  assignCase,
  addCaseNote,
  requestCaseVerification,
  escalateCase,
  recordCaseDisposition,
  resolveCase,
  closeCase,
  reopenCase,
} from "@/app/(dashboard)/actions";
import type { CaseRecord } from "@/lib/operations/cases";
import type { CaseState } from "@/types/domain";

const stateOrder: CaseState[] = ["OPEN", "ACKNOWLEDGED", "INVESTIGATING", "ESCALATED", "RESOLVED", "CLOSED"];

const seededUsers = [
  { id: "40000000-0000-4000-8000-000000000002", name: "Operations A" },
  { id: "40000000-0000-4000-8000-000000000003", name: "Operations B" },
  { id: "40000000-0000-4000-8000-000000000004", name: "Data Steward C" },
  { id: "40000000-0000-4000-8000-000000000006", name: "Demo Administrator" },
];

export function CaseWorkflow({ caseRecord }: { caseRecord: CaseRecord }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  // Note draft state
  const [noteDraft, setNoteDraft] = useState("");

  // Resolution inputs
  const [resolutionCode, setResolutionCode] = useState("VERIFIED_NORMAL_ACTIVITY");
  const [resolutionSummary, setResolutionSummary] = useState("");

  // Verification request summary
  const [verificationSummary, setVerificationSummary] = useState("");
  const [showVerificationForm, setShowVerificationForm] = useState(false);

  // Disposition inputs
  const [dispositionSummary, setDispositionSummary] = useState("");
  const [showDispositionForm, setShowDispositionForm] = useState(false);

  function executeAction(actionFn: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await actionFn();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Workflow command failed.");
      }
    });
  }

  function handleAcknowledge() {
    executeAction(() => acknowledgeCase(caseRecord.id, caseRecord.version));
  }

  function handleAssign(assigneeUserId: string) {
    if (!assigneeUserId) return;
    executeAction(() => assignCase(caseRecord.id, caseRecord.version, assigneeUserId));
  }

  function handleAddNote() {
    const body = noteDraft.trim();
    if (!body) return;
    executeAction(async () => {
      await addCaseNote(caseRecord.id, caseRecord.version, body);
      setNoteDraft("");
    });
  }

  function handleRequestVerification() {
    const summary = verificationSummary.trim();
    if (!summary) return;
    executeAction(async () => {
      await requestCaseVerification(caseRecord.id, caseRecord.version, summary);
      setVerificationSummary("");
      setShowVerificationForm(false);
    });
  }

  function handleEscalate() {
    executeAction(() => escalateCase(caseRecord.id, caseRecord.version));
  }

  function handleRecordDisposition() {
    const disp = dispositionSummary.trim();
    if (!disp) return;
    executeAction(async () => {
      await recordCaseDisposition(caseRecord.id, caseRecord.version, disp);
      setDispositionSummary("");
      setShowDispositionForm(false);
    });
  }

  function handleResolve() {
    const summary = resolutionSummary.trim();
    if (!summary) return;
    executeAction(async () => {
      await resolveCase(caseRecord.id, caseRecord.version, resolutionCode, summary);
      setResolutionSummary("");
    });
  }

  function handleClose() {
    executeAction(() => closeCase(caseRecord.id, caseRecord.version));
  }

  function handleReopen() {
    executeAction(() => reopenCase(caseRecord.id, caseRecord.version));
  }

  const { state, owner, notes, timeline } = caseRecord;

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      <Card className="border border-border shadow-none">
        <CardHeader>
          <CardTitle>Lifecycle Status</CardTitle>
          <CardDescription>Live progression matches authoritative backend transitions.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {stateOrder.map((step) => {
              const reached = stateOrder.indexOf(state) >= stateOrder.indexOf(step);
              return (
                <li
                  key={step}
                  className={`rounded-lg border p-3 text-xs font-medium ${
                    reached ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
                  }`}
                >
                  {step.replaceAll("_", " ")}
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border border-border shadow-none">
          <CardHeader>
            <CardTitle>Case Commands</CardTitle>
            <CardDescription>Actions governed by current state ({state}).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {state === "OPEN" && (
                <Button disabled={isPending} onClick={handleAcknowledge}>
                  <ClipboardCheckIcon className="mr-2 size-4" />
                  Acknowledge Case
                </Button>
              )}

              {state === "ACKNOWLEDGED" && (
                <Button disabled={isPending} onClick={() => setShowVerificationForm(!showVerificationForm)}>
                  <CircleDotDashedIcon className="mr-2 size-4" />
                  {showVerificationForm ? "Cancel Verification" : "Start Investigation (Verify)"}
                </Button>
              )}

              {state === "INVESTIGATING" && (
                <>
                  <Button disabled={isPending} variant="outline" onClick={() => setShowVerificationForm(!showVerificationForm)}>
                    {showVerificationForm ? "Cancel Verification" : "Request Verification"}
                  </Button>
                  <Button disabled={isPending} variant="outline" onClick={() => setShowDispositionForm(!showDispositionForm)}>
                    {showDispositionForm ? "Cancel Disposition" : "Record Disposition"}
                  </Button>
                  <Button disabled={isPending} variant="outline" onClick={handleEscalate}>
                    <ShieldAlertIcon className="mr-2 size-4" />
                    Escalate
                  </Button>
                </>
              )}

              {state === "ESCALATED" && (
                <Button disabled={isPending} variant="outline" onClick={() => setShowDispositionForm(!showDispositionForm)}>
                  {showDispositionForm ? "Cancel Disposition" : "Record Disposition"}
                </Button>
              )}

              {state === "RESOLVED" && (
                <Button disabled={isPending} onClick={handleClose}>
                  <CheckCircle2Icon className="mr-2 size-4" />
                  Close Case
                </Button>
              )}

              {state === "CLOSED" && (
                <Button disabled={isPending} variant="outline" onClick={handleReopen}>
                  Reopen Case
                </Button>
              )}
            </div>

            {/* Verification Form */}
            {showVerificationForm && (state === "ACKNOWLEDGED" || state === "INVESTIGATING") && (
              <div className="space-y-3 rounded-lg border border-border p-3">
                <p className="text-sm font-medium">Request Verification Details</p>
                <textarea
                  disabled={isPending}
                  className="min-h-20 w-full rounded-lg border border-input bg-background p-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  placeholder="Describe what needs to be verified..."
                  value={verificationSummary}
                  onChange={(e) => setVerificationSummary(e.target.value)}
                />
                <Button disabled={isPending || !verificationSummary.trim()} onClick={handleRequestVerification}>
                  Submit Verification Request
                </Button>
              </div>
            )}

            {/* Disposition Form */}
            {showDispositionForm && (state === "INVESTIGATING" || state === "ESCALATED") && (
              <div className="space-y-3 rounded-lg border border-border p-3">
                <p className="text-sm font-medium">Record Review Disposition</p>
                <textarea
                  disabled={isPending}
                  className="min-h-20 w-full rounded-lg border border-input bg-background p-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  placeholder="Record intermediate review findings..."
                  value={dispositionSummary}
                  onChange={(e) => setDispositionSummary(e.target.value)}
                />
                <Button disabled={isPending || !dispositionSummary.trim()} onClick={handleRecordDisposition}>
                  Save Disposition
                </Button>
              </div>
            )}

            {/* Assign User select */}
            {state !== "CLOSED" && state !== "RESOLVED" && (
              <label className="block space-y-1.5 text-sm font-medium">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <UserPlusIcon className="size-4" />
                  Assign Case Owner
                </span>
                <select
                  disabled={isPending}
                  className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  value={seededUsers.find((u) => u.id === owner || u.name === owner)?.id ?? ""}
                  onChange={(e) => handleAssign(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {seededUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* Resolve Form */}
            {(state === "INVESTIGATING" || state === "ESCALATED") && (
              <div className="space-y-3 rounded-lg border border-border p-3">
                <p className="text-sm font-medium">Resolve Case</p>
                <label className="block space-y-1.5 text-sm">
                  Resolution Code
                  <select
                    disabled={isPending}
                    className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    value={resolutionCode}
                    onChange={(e) => setResolutionCode(e.target.value)}
                  >
                    <option value="VERIFIED_NORMAL_ACTIVITY">Verified Normal Activity</option>
                    <option value="DATA_QUALITY_CONFIRMED">Data Quality Confirmed</option>
                    <option value="ESCALATED_TO_OPERATIONS">Escalated to Operations</option>
                    <option value="NO_FURTHER_REVIEW_REQUIRED">No Further Review Required</option>
                  </select>
                </label>
                <label className="block space-y-1.5 text-sm">
                  Resolution Summary
                  <textarea
                    disabled={isPending}
                    className="min-h-20 w-full rounded-lg border border-input bg-background p-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    placeholder="Provide resolution details..."
                    value={resolutionSummary}
                    onChange={(e) => setResolutionSummary(e.target.value)}
                  />
                </label>
                <Button disabled={isPending || !resolutionSummary.trim()} onClick={handleResolve}>
                  Resolve Case
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scoped Notes card */}
        <Card className="border border-border shadow-none">
          <CardHeader>
            <CardTitle>Scoped Notes</CardTitle>
            <CardDescription>Provider-scoped case log.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {state !== "CLOSED" && (
              <div className="space-y-2">
                <textarea
                  disabled={isPending}
                  className="min-h-20 w-full rounded-lg border border-input bg-background p-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  placeholder="Add a scoped note..."
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                />
                <Button disabled={isPending || !noteDraft.trim()} onClick={handleAddNote} variant="outline">
                  <MessageSquareTextIcon className="mr-2 size-4" />
                  Add Note
                </Button>
              </div>
            )}

            <div className="space-y-3 pt-2">
              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No scoped notes yet.</p>
              ) : (
                notes.map((note) => (
                  <article key={note.id} className="rounded-lg bg-muted p-3 text-sm">
                    <p className="font-semibold text-foreground">
                      {seededUsers.find((u) => u.id === note.author)?.name ?? note.author}
                    </p>
                    <p className="mt-1 break-words text-muted-foreground">{note.body}</p>
                    <p className="mt-2 text-[10px] text-muted-foreground/60">
                      {new Date(note.at).toLocaleString()}
                    </p>
                  </article>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline view */}
      <Card className="border border-border shadow-none">
        <CardHeader>
          <CardTitle>Audit Timeline</CardTitle>
          <CardDescription>Immutable workflow event trail.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4 border-l border-border pl-5">
            {timeline.map((event) => (
              <li key={event.id} className="relative">
                <span className="absolute -left-[1.7rem] top-1 size-3 rounded-full border-2 border-background bg-primary" />
                <p className="text-sm font-semibold">{event.action.replaceAll("_", " ")}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  By {seededUsers.find((u) => u.id === event.actor)?.name ?? event.actor} · {event.summary}
                </p>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground/60">
                  {event.from ?? "—"} → {event.to ?? event.from ?? "—"} · {event.correlationId} · {new Date(event.at).toLocaleString()}
                </p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
