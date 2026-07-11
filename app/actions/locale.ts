"use server";

import { cookies } from "next/headers";

import { localeCookieName, locales, type Locale } from "@/lib/i18n/locale";

export async function setLocale(locale: Locale) {
  if (!locales.includes(locale)) return;
  (await cookies()).set(localeCookieName, locale, { httpOnly: false, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
}
