"use client";

import { use } from "react";
import { SimulationView } from "@/components/simulation/simulation-view";
import { parseSimulationState } from "@/lib/operations/simulation";

export default function SimulationPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = use(searchParams);
  const state = parseSimulationState(params);
  return <SimulationView {...state} />;
}
