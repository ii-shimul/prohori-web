import { redirect } from "next/navigation";

import { getVerifiedClaims } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const claims = await getVerifiedClaims();
  redirect(claims ? "/dashboard" : "/login");
}
