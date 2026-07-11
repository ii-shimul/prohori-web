"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlertIcon, RotateCcwIcon, StepForwardIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { simulationScenarios, type ScenarioCode, type ScenarioStage } from "@/lib/operations/simulation";
import { minimalApiRequest } from "@/lib/api/minimal-client";

function nextStage(stage: ScenarioStage): ScenarioStage {
  if (stage === "baseline") return "started";
  if (stage === "started") return "step-1";
  return "step-2";
}

function stageLabel(stage: ScenarioStage) {
  if (stage === "baseline") return "Baseline Ready";
  if (stage === "started") return "Scenario Started";
  if (stage === "step-1") return "Step 1 Complete";
  return "Step 2 Complete";
}

export function SimulationView({ scenario: selectedScenario, stage }: { scenario: ScenarioCode; stage: ScenarioStage }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const scenario = simulationScenarios.find((item) => item.code === selectedScenario) ?? simulationScenarios[0];
  const next = nextStage(stage);

  // Evidence Href pointing to production routes instead of preview
  const liveEvidenceHref = scenario.evidenceHref.replace("/preview/operations", "");

  function handleReset() {
    setError(null);
    startTransition(async () => {
      try {
        await minimalApiRequest("simulation/reset", { method: "POST" });
        router.push(`/simulation?scenario=${scenario.code}&stage=baseline`);
      } catch (err: any) {
        setError(err.message || "Reset failed.");
      }
    });
  }

  function handleAction() {
    setError(null);
    startTransition(async () => {
      try {
        if (stage === "baseline") {
          await minimalApiRequest("simulation/start", {
            method: "POST",
            body: JSON.stringify({ scenario: scenario.code }),
          });
        } else {
          await minimalApiRequest("simulation/step", {
            method: "POST",
            body: JSON.stringify({ scenario: scenario.code }),
          });
        }
        router.push(`/simulation?scenario=${scenario.code}&stage=${next}`);
      } catch (err: any) {
        setError(err.message || "Simulation action failed.");
      }
    });
  }

  return (
    <section aria-labelledby="simulation-title" className="mx-auto max-w-6xl space-y-6">
      <header className="border-b border-border pb-5">
        <p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">Demo Admin Only</p>
        <h1 id="simulation-title" className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Scenario Control</h1>
        <p className="mt-2 max-w-3xl text-pretty text-muted-foreground">
          Deterministic live scenario controls. Controls send synthetic simulation batches to the NestJS API; they never mutate real client balances or ledger state.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      <Card className="border border-border shadow-none" role="alert">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CircleAlertIcon aria-hidden="true" className="size-5 text-primary" />
            <CardTitle>Live Simulation Active</CardTitle>
          </div>
          <CardDescription>
            Resetting, starting, or stepping scenarios will inject synthetic transaction feeds directly into the database.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {simulationScenarios.map((item) => (
          <Link
            key={item.code}
            href={`/simulation?scenario=${item.code}&stage=baseline`}
            className={cn(
              "rounded-xl border p-4 no-underline transition-[background-color,border-color,box-shadow] hover:border-primary/40 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              item.code === scenario.code ? "border-primary bg-primary/5" : "border-border bg-background"
            )}
          >
            <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">Scenario {item.code}</p>
            <p className="mt-2 text-balance font-medium text-foreground">{item.title}</p>
          </Link>
        ))}
      </div>

      <Card className="border border-border shadow-none">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-balance">Scenario {scenario.code}: {scenario.title}</CardTitle>
              <CardDescription className="mt-2 text-pretty">{scenario.description}</CardDescription>
            </div>
            <Badge variant="outline" className="border-secondary/40 bg-secondary/10 text-primary">{stageLabel(stage)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <ol className="space-y-2 text-sm">
            {scenario.steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs tabular-nums">{index + 1}</span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-3 border-t border-border pt-4">
            <Button
              disabled={isPending}
              variant="outline"
              onClick={handleReset}
              className="cursor-pointer"
            >
              <RotateCcwIcon aria-hidden="true" />
              Reset Baseline
            </Button>
            <Button
              disabled={isPending}
              variant="default"
              onClick={handleAction}
              className="cursor-pointer"
            >
              <StepForwardIcon aria-hidden="true" />
              {stage === "baseline" ? "Start Scenario" : stage === "step-2" ? "Restart Scenario" : "Run Next Step"}
            </Button>
            <Link
              href={liveEvidenceHref}
              className={cn(buttonVariants({ variant: "secondary" }))}
            >
              {scenario.evidenceLabel.replace("Scenario", "Live")}
            </Link>
          </div>
          <p aria-live="polite" className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            Progress: {stageLabel(stage)}. Open related evidence route after each step; refresh preserves this deterministic URL state.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
