import type { UserRole } from "@/types/auth";

const previewRoles = new Set<UserRole>(["PROVIDER_OPERATIONS", "PLATFORM_MANAGEMENT", "DATA_STEWARD", "DEMO_ADMIN"]);

export function parsePreviewRole(value: string | string[] | undefined, fallback: UserRole): UserRole {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && previewRoles.has(candidate as UserRole) ? (candidate as UserRole) : fallback;
}
