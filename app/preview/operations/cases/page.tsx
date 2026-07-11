import { notFound } from "next/navigation";

import { CasesView } from "@/components/cases/cases-view";

export default function PreviewCasesPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <CasesView detailBasePath="/preview/operations/cases" />;
}
