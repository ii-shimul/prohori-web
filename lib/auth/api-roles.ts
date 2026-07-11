import type { UserRole } from "@/types/auth";

type RoleSource = {
  memberships: readonly { readonly role: UserRole }[];
  assignments: readonly { readonly role: UserRole }[];
};

const rolePriority: readonly UserRole[] = [
  "DEMO_ADMIN",
  "PLATFORM_MANAGEMENT",
  "DATA_STEWARD",
  "VALIDATION_AUDITOR",
  "PROVIDER_OPERATIONS",
  "OUTLET_AGENT",
];

export function getApiRoles(user: RoleSource): readonly UserRole[] {
  const grantedRoles = new Set<UserRole>([
    ...user.memberships.map((membership) => membership.role),
    ...user.assignments.map((assignment) => assignment.role),
  ]);

  return rolePriority.filter((role) => grantedRoles.has(role));
}

export function hasAnyApiRole(user: RoleSource, allowedRoles: readonly UserRole[]): boolean {
  const roles = getApiRoles(user);
  const roleSet = new Set(roles);
  return allowedRoles.some((role) => roleSet.has(role));
}
