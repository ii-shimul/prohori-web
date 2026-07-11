const MINOR_UNITS_PER_BDT = 100n;

export function formatBdtMinor(
  value: bigint | string,
  locale = "en-BD",
): string {
  const amount = typeof value === "bigint" ? value : BigInt(value);
  const sign = amount < 0n ? "−" : "";
  const absoluteAmount = amount < 0n ? -amount : amount;
  const whole = absoluteAmount / MINOR_UNITS_PER_BDT;
  const fraction = (absoluteAmount % MINOR_UNITS_PER_BDT)
    .toString()
    .padStart(2, "0");

  return `${sign}৳${new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(whole)}.${fraction}`;
}
