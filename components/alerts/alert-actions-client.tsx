"use client";

import { useState, useTransition } from "react";
import { CircleCheckIcon, ShieldAlertIcon, UserPlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { acknowledgeAlert, assignAlert, createAlertCase } from "@/app/(dashboard)/actions";

const seededUsers = [
  { id: "40000000-0000-4000-8000-000000000002", name: "Operations A" },
  { id: "40000000-0000-4000-8000-000000000003", name: "Operations B" },
  { id: "40000000-0000-4000-8000-000000000004", name: "Data Steward C" },
  { id: "40000000-0000-4000-8000-000000000006", name: "Demo Administrator" },
];

export function AlertActionsClient({
  alertId,
  status,
  owner,
  hasLinkedCase,
}: {
  alertId: string;
  status: string;
  owner: string;
  hasLinkedCase: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAcknowledge() {
    setError(null);
    startTransition(async () => {
      try {
        await acknowledgeAlert(alertId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Acknowledge alert failed.");
      }
    });
  }

  function handleAssign(assigneeUserId: string) {
    if (!assigneeUserId) return;
    setError(null);
    startTransition(async () => {
      try {
        await assignAlert(alertId, assigneeUserId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Assign alert failed.");
      }
    });
  }

  function handleCreateCase() {
    setError(null);
    startTransition(async () => {
      try {
        await createAlertCase(alertId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Create case failed.");
      }
    });
  }

  const showAcknowledge = status === "active";
  const showCreateCase = !hasLinkedCase && status !== "resolved";

  return (
    <Card className="border border-border shadow-none">
      <CardHeader>
        <CardTitle>Alert Workflow</CardTitle>
        <CardDescription>Actions on this episode call the NestJS API.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {showAcknowledge && (
            <Button
              onClick={handleAcknowledge}
              disabled={isPending}
              className="w-full justify-center"
            >
              <CircleCheckIcon className="mr-2 size-4" />
              Acknowledge Alert
            </Button>
          )}

          {showCreateCase && (
            <Button
              onClick={handleCreateCase}
              disabled={isPending}
              variant="secondary"
              className="w-full justify-center"
            >
              <ShieldAlertIcon className="mr-2 size-4" />
              Create Investigation Case
            </Button>
          )}
        </div>

        {status !== "resolved" && (
          <label className="block space-y-1.5 text-sm font-medium">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <UserPlusIcon className="size-4" />
              Assign Alert Owner
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
      </CardContent>
    </Card>
  );
}
