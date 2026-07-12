import { notFound } from "next/navigation";

import { CasesView } from "@/components/cases/cases-view";
import { AppShell } from "@/components/layout/app-shell";

export default function PreviewCasesPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <AppShell role="PROVIDER_OPERATIONS" showSignOut={false}><CasesView variant="preview" /></AppShell>;
}
