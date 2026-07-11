import { cache } from "react";
import { cookies } from "next/headers";

export const locales = ["en", "bn"] as const;
export type Locale = (typeof locales)[number];
export const localeCookieName = "prohori_locale";

export const getLocale = cache(async (): Promise<Locale> => {
  const value = (await cookies()).get(localeCookieName)?.value;
  return value === "bn" ? "bn" : "en";
});
