import { redirect } from "next/navigation";

import { getVerifiedClaims } from "./session";

export async function requireAuthenticatedUser() {
  const claims = await getVerifiedClaims();

  if (!claims) {
    redirect("/login");
  }

  return claims;
}
