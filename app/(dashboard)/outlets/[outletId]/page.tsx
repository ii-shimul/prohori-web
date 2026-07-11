import { notFound } from "next/navigation";

import { OutletDetailView } from "@/components/outlets/outlet-detail-view";
import { getOutletDetail } from "@/lib/operations/outlet-detail";

export default async function OutletDetailPage({
  params,
}: {
  params: Promise<{ outletId: string }>;
}) {
  const outlet = await getOutletDetail((await params).outletId, "api");

  if (!outlet) {
    notFound();
  }

  return <OutletDetailView backHref="/outlets" outlet={outlet} />;
}
