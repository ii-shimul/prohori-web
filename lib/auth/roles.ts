import type { UserRole } from "@/types/auth";

import { getApiRoles, hasAnyApiRole } from "./api-roles";
import { requireApiCurrentUser } from "./current-user";

export async function getDashboardRoles(): Promise<readonly UserRole[]> {
  return getApiRoles(await requireApiCurrentUser());
}

export async function canViewDashboardRoute(allowedRoles: readonly UserRole[]): Promise<boolean> {
  return hasAnyApiRole(await requireApiCurrentUser(), allowedRoles);
}
