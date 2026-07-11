import { notFound } from "next/navigation";

import { OutletDetailView } from "@/components/outlets/outlet-detail-view";
import { getOutletDetail } from "@/lib/operations/outlet-detail";

export default async function PreviewOutletDetailPage({
  params,
}: {
  params: Promise<{ outletId: string }>;
}) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const outlet = await getOutletDetail((await params).outletId);

  if (!outlet) {
    notFound();
  }

  return <OutletDetailView backHref="/preview/operations" outlet={outlet} />;
}
