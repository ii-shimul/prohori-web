import type { components } from "@/lib/api/generated";

export const userRoles = [
  "OUTLET_AGENT",
  "PROVIDER_OPERATIONS",
  "PLATFORM_MANAGEMENT",
  "DATA_STEWARD",
  "VALIDATION_AUDITOR",
  "DEMO_ADMIN",
] as const satisfies readonly components["schemas"]["UserRole"][];

export type UserRole = components["schemas"]["UserRole"];
