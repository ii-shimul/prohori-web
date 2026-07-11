import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return <EmptyState title="Workspace Page Not Found" description="This page is unavailable in your current workspace. Return to Dashboard to continue." action={<Button render={<Link href="/dashboard" />} type="button">Return to Dashboard</Button>} />;
}
