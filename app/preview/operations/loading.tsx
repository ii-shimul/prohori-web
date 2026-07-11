import { AppShell } from "@/components/layout/app-shell";
import { PageLoading } from "@/components/shared/page-loading";

export default function PreviewLoading() {
  return <AppShell role="PROVIDER_OPERATIONS" showSignOut={false}><PageLoading /></AppShell>;
}
