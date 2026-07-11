"use client";

import { useTransition } from "react";
import { LanguagesIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/locale";

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const nextLocale: Locale = locale === "en" ? "bn" : "en";

  return <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => startTransition(() => { document.cookie = `prohori_locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`; router.refresh(); })} aria-label={locale === "en" ? "Switch language to Bengali" : "Switch language to English"}><LanguagesIcon aria-hidden="true" />{locale === "en" ? "বাংলা" : "English"}</Button>;
}
