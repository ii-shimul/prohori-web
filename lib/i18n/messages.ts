import en from "@/messages/en.json";
import bn from "@/messages/bn.json";

import type { Locale } from "./locale";

type MessageKey = keyof typeof en;
const messages = { en, bn } as const;

export function t(locale: Locale, key: MessageKey | string): string {
  const typedKey = key as MessageKey;
  return messages[locale][typedKey] ?? en[typedKey] ?? key;
}
