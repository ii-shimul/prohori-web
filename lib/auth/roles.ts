import type { UserRole } from "@/types/auth";

import { getVerifiedClaims } from "./session";

const knownRoles = new Set<UserRole>([
  "OUTLET_AGENT",
  "PROVIDER_OPERATIONS",
  "PLATFORM_MANAGEMENT",
  "DATA_STEWARD",
  "VALIDATION_AUDITOR",
  "DEMO_ADMIN",
]);

function roleFromClaims(claims: Awaited<ReturnType<typeof getVerifiedClaims>>): UserRole {
  if (!claims) return "PROVIDER_OPERATIONS";

  const metadata = claims.app_metadata;
  if (!metadata || typeof metadata !== "object" || !("role" in metadata)) {
    return "PROVIDER_OPERATIONS";
  }

  const role = metadata.role;
  return typeof role === "string" && knownRoles.has(role as UserRole)
    ? (role as UserRole)
    : "PROVIDER_OPERATIONS";
}

export async function getDashboardRole(): Promise<UserRole> {
  return roleFromClaims(await getVerifiedClaims());
}

export async function canViewDashboardRoute(allowedRoles: readonly UserRole[]): Promise<boolean> {
  return allowedRoles.includes(await getDashboardRole());
}
