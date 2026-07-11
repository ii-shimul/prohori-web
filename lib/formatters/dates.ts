export function formatDateTime(
  value: string | Date,
  locale = "en-BD",
  timeZone = "UTC",
): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(typeof value === "string" ? new Date(value) : value);
}
