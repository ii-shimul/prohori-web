import Link from "next/link";
import { CircleAlertIcon, RotateCcwIcon, StepForwardIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { simulationScenarios, type ScenarioCode, type ScenarioStage } from "@/lib/operations/simulation";

function controlHref(scenario: ScenarioCode, stage: ScenarioStage) {
  return `/preview/operations/simulation?scenario=${scenario}&stage=${stage}`;
}

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
  const scenario = simulationScenarios.find((item) => item.code === selectedScenario) ?? simulationScenarios[0];
  const next = nextStage(stage);

  return <section aria-labelledby="simulation-title" className="mx-auto max-w-6xl space-y-6"><header className="border-b border-border pb-5"><p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">Demo Admin Only</p><h1 id="simulation-title" className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Scenario Control</h1><p className="mt-2 max-w-3xl text-pretty text-muted-foreground">Deterministic synthetic preview. Controls update URL-backed preview state only; they never send a financial action or call a live API.</p></header><Card className="border border-cta-gold/60 bg-cta-gold/10 shadow-none" role="alert"><CardHeader><div className="flex items-center gap-2"><CircleAlertIcon aria-hidden="true" className="size-5 text-primary" /><CardTitle>Synthetic Scenario Warning</CardTitle></div><CardDescription>Reset, start, and step controls are available only in development preview until API owner provides authorized scenario endpoints.</CardDescription></CardHeader></Card><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{simulationScenarios.map((item) => <Link key={item.code} href={controlHref(item.code, "baseline")} className={cn("rounded-xl border p-4 no-underline transition-[background-color,border-color,box-shadow] hover:border-primary/40 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring", item.code === scenario.code ? "border-primary bg-primary/5" : "border-border bg-background")}><p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">Scenario {item.code}</p><p className="mt-2 text-balance font-medium text-foreground">{item.title}</p></Link>)}</div><Card className="border border-border shadow-none"><CardHeader><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><CardTitle className="text-balance">Scenario {scenario.code}: {scenario.title}</CardTitle><CardDescription className="mt-2 text-pretty">{scenario.description}</CardDescription></div><Badge variant="outline" className="border-secondary/40 bg-secondary/10 text-primary">{stageLabel(stage)}</Badge></div></CardHeader><CardContent className="space-y-5"><ol className="space-y-2 text-sm">{scenario.steps.map((step, index) => <li key={step} className="flex gap-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs tabular-nums">{index + 1}</span><span className="pt-0.5">{step}</span></li>)}</ol><div className="flex flex-wrap gap-3 border-t border-border pt-4"><Link href={controlHref(scenario.code, "baseline")} className={buttonVariants({ variant: "outline" })}><RotateCcwIcon aria-hidden="true" />Reset Baseline</Link><Link href={controlHref(scenario.code, next)} className={buttonVariants({ variant: "default" })}><StepForwardIcon aria-hidden="true" />{stage === "baseline" ? "Start Scenario" : stage === "step-2" ? "Restart Scenario" : "Run Next Step"}</Link><Button render={<Link href={scenario.evidenceHref} />} variant="secondary">{scenario.evidenceLabel}</Button></div><p aria-live="polite" className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">Preview progress: {stageLabel(stage)}. Open related evidence route after each step; refresh preserves this deterministic URL state.</p></CardContent></Card></section>;
}
