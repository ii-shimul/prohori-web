"use client";

import { RouteError } from "@/components/shared/route-error";

export default function GlobalError({ reset }: { reset: () => void }) {
  return <main className="mx-auto min-h-screen max-w-3xl px-4 py-12 sm:px-6"><RouteError reset={reset} /></main>;
}
