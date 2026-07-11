import { Skeleton } from "@/components/ui/skeleton";

export function PageLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6">
      <p className="sr-only">Loading…</p>
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}
