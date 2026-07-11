import { redirect } from "next/navigation";

import { getVerifiedClaims } from "./session";

export async function requireAuth() {
  const claims = await getVerifiedClaims();

  if (!claims) {
    redirect("/login");
  }

  return claims;
}

export const requireAuthenticatedUser = requireAuth;
