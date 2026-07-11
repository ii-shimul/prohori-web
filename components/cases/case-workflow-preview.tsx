"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2Icon, CircleDotDashedIcon, ClipboardCheckIcon, MessageSquareTextIcon, ShieldAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CaseRecord, CaseTimelineEvent } from "@/lib/operations/cases";
import type { CaseState } from "@/types/domain";

const stateOrder: CaseState[] = ["OPEN", "ACKNOWLEDGED", "INVESTIGATING", "ESCALATED", "RESOLVED", "CLOSED"];

function eventFor(
  action: string,
  from: CaseState,
  to: CaseState | null,
  summary: string,
  version: number,
): CaseTimelineEvent {
  return {
    id: `fixture-event-${version}`,
    at: new Date().toISOString(),
    actor: "Preview Operator",
    action,
    from,
    to,
    summary,
    correlationId: `fixture-case-204-v${version}`,
  };
}

export function CaseWorkflowPreview({ caseRecord }: { caseRecord: CaseRecord }) {
  const snapshotKey = `${caseRecord.id}:${caseRecord.state}:${caseRecord.owner}:${caseRecord.timeline.at(-1)?.id ?? "empty"}:${caseRecord.notes.length}`;
  return <CaseWorkflowDraft key={snapshotKey} caseRecord={caseRecord} />;
}

function CaseWorkflowDraft({ caseRecord }: { caseRecord: CaseRecord }) {
  const [state, setState] = useState(() => caseRecord.state);
  const [owner, setOwner] = useState(() => caseRecord.owner);
  const [notes, setNotes] = useState(() => caseRecord.notes);
  const [timeline, setTimeline] = useState(() => caseRecord.timeline);
  const version = useRef(1);
  const [noteDraft, setNoteDraft] = useState("");
  const [resolutionCode, setResolutionCode] = useState("VERIFIED_NORMAL");
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [message, setMessage] = useState("Preview commands stay in this browser session.");
  const executedKeys = useRef(new Set<string>());

  useEffect(() => {
    const hasDraft = Boolean(noteDraft || resolutionSummary);
    if (!hasDraft) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [noteDraft, resolutionSummary]);

  function runCommand(action: string, nextState: CaseState | null, summary: string) {
    const idempotencyKey = `${caseRecord.id}:${version.current}:${action}`;
    if (executedKeys.current.has(idempotencyKey)) {
      setMessage("Duplicate preview command ignored.");
      return;
    }

    executedKeys.current.add(idempotencyKey);
    const event = eventFor(action, state, nextState, summary, version.current);
    setTimeline((current) => [...current, event]);
    if (nextState) setState(nextState);
    version.current += 1;
    setMessage(`${action} recorded. Idempotency key: ${idempotencyKey}`);
  }

  function addNote() {
    const body = noteDraft.trim();
    if (!body) {
      setMessage("Enter a scoped note before saving.");
      return;
    }
    setNotes((current) => [...current, { id: `fixture-note-${version.current}`, at: new Date().toISOString(), author: "Preview Operator", body }]);
    runCommand("Scoped note added", null, "Case note recorded for authorized provider scope.");
    setNoteDraft("");
  }

  function resolveCase() {
    const summary = resolutionSummary.trim();
    if (!summary) {
      setMessage("Add resolution summary before resolving case.");
      return;
    }
    runCommand("Case resolved", "RESOLVED", `${resolutionCode}: ${summary}`);
    setResolutionSummary("");
  }

  return (
    <div className="space-y-4">
      <p aria-live="polite" className="rounded-lg border border-cta-gold/60 bg-cta-gold/10 p-3 text-sm text-primary">Synthetic preview only. {message}</p>
      <Card className="border border-border shadow-none"><CardHeader><CardTitle>Lifecycle</CardTitle><CardDescription>Each transition creates one visible audit event.</CardDescription></CardHeader><CardContent><ol className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">{stateOrder.map((step) => { const reached = stateOrder.indexOf(state) >= stateOrder.indexOf(step); return <li key={step} className={`rounded-lg border p-3 text-xs font-medium ${reached ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>{step.replaceAll("_", " ")}</li>; })}</ol></CardContent></Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border border-border shadow-none"><CardHeader><CardTitle>Case Commands</CardTitle><CardDescription>Buttons follow allowed preview transitions. No financial action exists.</CardDescription></CardHeader><CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {state === "OPEN" ? <Button onClick={() => runCommand("Case acknowledged", "ACKNOWLEDGED", "Alert received and ownership review started.")}><ClipboardCheckIcon aria-hidden="true" />Acknowledge</Button> : null}
            {state === "ACKNOWLEDGED" ? <Button onClick={() => runCommand("Investigation started", "INVESTIGATING", "Evidence review started.")}><CircleDotDashedIcon aria-hidden="true" />Start Investigation</Button> : null}
            {state === "INVESTIGATING" ? <><Button onClick={() => runCommand("Verification requested", null, "Verification request recorded for authorized operations.")} variant="outline">Request Verification</Button><Button onClick={() => runCommand("Case escalated", "ESCALATED", "Escalated for coordinated review.")} variant="outline"><ShieldAlertIcon aria-hidden="true" />Escalate</Button></> : null}
            {state === "RESOLVED" ? <Button onClick={() => runCommand("Case closed", "CLOSED", "Review closed with recorded resolution.")}><CheckCircle2Icon aria-hidden="true" />Close Case</Button> : null}
            {state === "CLOSED" ? <Button onClick={() => runCommand("Case reopened", "RESOLVED", "Case reopened for further review.")} variant="outline">Reopen Case</Button> : null}
          </div>
          <label className="block space-y-1.5 text-sm font-medium">Assign Owner<select autoComplete="off" className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" name="owner" onChange={(event) => { setOwner(event.target.value); runCommand("Case reassigned", null, `Owner changed to ${event.target.value}.`); }} value={owner}><option>Unassigned</option><option>M. Rahman</option><option>S. Ahmed</option><option>Data Quality Desk</option></select></label>
          {(state === "INVESTIGATING" || state === "ESCALATED") ? <div className="space-y-3 rounded-lg border border-border p-3"><p className="text-sm font-medium">Resolve Case</p><label className="block space-y-1.5 text-sm">Resolution Code<select autoComplete="off" className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" name="resolutionCode" onChange={(event) => setResolutionCode(event.target.value)} value={resolutionCode}><option value="VERIFIED_NORMAL">Verified Normal</option><option value="DATA_CORRECTED">Data Corrected</option><option value="ESCALATION_COMPLETED">Escalation Completed</option></select></label><label className="block space-y-1.5 text-sm">Resolution Summary<textarea autoComplete="off" className="min-h-20 w-full rounded-lg border border-input bg-background p-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" name="resolutionSummary" onChange={(event) => setResolutionSummary(event.target.value)} placeholder="Explain review disposition…" value={resolutionSummary} /></label><Button onClick={resolveCase}>Resolve Case</Button></div> : null}
        </CardContent></Card>
        <Card className="border border-border shadow-none"><CardHeader><CardTitle>Scoped Notes</CardTitle><CardDescription>Notes stay within authorized provider scope.</CardDescription></CardHeader><CardContent className="space-y-3"><label className="block space-y-1.5 text-sm font-medium">Add Note<textarea autoComplete="off" className="min-h-24 w-full rounded-lg border border-input bg-background p-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" name="note" onChange={(event) => setNoteDraft(event.target.value)} placeholder="Add review context…" value={noteDraft} /></label><Button onClick={addNote} variant="outline"><MessageSquareTextIcon aria-hidden="true" />Add Scoped Note</Button><div className="space-y-3">{notes.length === 0 ? <p className="text-sm text-muted-foreground">No scoped notes yet.</p> : notes.map((note) => <article key={note.id} className="rounded-lg bg-muted p-3 text-sm"><p className="font-medium">{note.author}</p><p className="mt-1 break-words text-muted-foreground">{note.body}</p></article>)}</div></CardContent></Card>
      </div>
      <Card className="border border-border shadow-none"><CardHeader><CardTitle>Audit Timeline</CardTitle><CardDescription>Actor, action, state transition, time, and correlation ID.</CardDescription></CardHeader><CardContent><ol className="space-y-4 border-l border-border pl-5">{timeline.map((event) => <li key={event.id} className="relative"><span className="absolute -left-[1.7rem] top-1 size-3 rounded-full border-2 border-background bg-primary" /><p className="text-sm font-semibold">{event.action}</p><p className="mt-1 text-sm text-muted-foreground">{event.actor} · {event.summary}</p><p className="mt-1 font-mono text-xs text-muted-foreground">{event.from ?? "—"} → {event.to ?? event.from ?? "—"} · {event.correlationId}</p></li>)}</ol></CardContent></Card>
    </div>
  );
}
