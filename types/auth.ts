export const userRoles = [
  "OUTLET_AGENT",
  "PROVIDER_OPERATIONS",
  "PLATFORM_MANAGEMENT",
  "DATA_STEWARD",
  "VALIDATION_AUDITOR",
  "DEMO_ADMIN",
] as const;

export type UserRole = (typeof userRoles)[number];
