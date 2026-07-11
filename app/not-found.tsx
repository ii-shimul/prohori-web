import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return <main className="mx-auto min-h-screen max-w-3xl px-4 py-12 sm:px-6"><EmptyState title="Page Not Found" description="Check the address or return to the operations workspace." action={<Button render={<Link href="/" />} type="button">Return Home</Button>} /></main>;
}
