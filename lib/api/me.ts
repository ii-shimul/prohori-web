import type { components } from "@/lib/api/generated";

import { apiRequest } from "./client";

export type CurrentUser = components["schemas"]["CurrentUser"];

export function getCurrentUser(accessToken: string): Promise<CurrentUser> {
  return apiRequest<CurrentUser>("me", accessToken);
}
