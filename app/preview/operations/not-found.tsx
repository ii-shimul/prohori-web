import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function PreviewNotFound() {
  return <AppShell role="PROVIDER_OPERATIONS" showSignOut={false}><EmptyState title="Preview Page Not Found" description="This synthetic preview route is unavailable. Return to operations preview." action={<Button render={<Link href="/preview/operations" />} type="button">Return to Preview</Button>} /></AppShell>;
}
