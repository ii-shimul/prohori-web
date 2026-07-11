import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser, type CurrentUser } from "@/lib/api/me";
import { ApiClientError } from "@/lib/api/errors";
import { getVerifiedAccessToken } from "@/lib/auth/session";

export const getApiCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const accessToken = await getVerifiedAccessToken();

  if (!accessToken) return null;
  return getCurrentUser(accessToken);
});

export async function requireApiCurrentUser(): Promise<CurrentUser> {
  try {
    const user = await getApiCurrentUser();

    if (!user) redirect("/login");
    return user;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      redirect("/login");
    }

    throw error;
  }
}
