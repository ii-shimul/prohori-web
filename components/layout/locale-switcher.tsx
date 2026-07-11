"use client";

import { useTransition } from "react";
import { LanguagesIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { setLocale } from "@/app/actions/locale";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/locale";

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const nextLocale: Locale = locale === "en" ? "bn" : "en";

  return <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => startTransition(async () => { await setLocale(nextLocale); router.refresh(); })} aria-label={locale === "en" ? "Switch language to Bengali" : "Switch language to English"}><LanguagesIcon aria-hidden="true" />{locale === "en" ? "বাংলা" : "English"}</Button>;
}
