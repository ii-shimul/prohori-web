import { FlaskConicalIcon } from "lucide-react";

export function SyntheticBanner() {
  return (
    <div className="border-b border-[#d7b036] bg-accent px-4 py-2 text-sm text-accent-foreground">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-2">
        <FlaskConicalIcon aria-hidden="true" className="size-4 shrink-0" />
        <p>
          Synthetic prototype data. Use for demonstration and review only.
        </p>
      </div>
    </div>
  );
}
