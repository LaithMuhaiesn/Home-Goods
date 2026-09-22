const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Money renders as "12.50 EUR": two decimals, a space, then the ISO code.
 * Never a currency symbol, never locale-dependent.
 */
export function money(value: number): string {
  return `${value.toFixed(2)} EUR`;
}

/**
 * Date renders as "15 Sep 2026": day, three-letter English month, year.
 * No ordinals, no slashes. Parsed from the ISO date in UTC so the displayed
 * day is identical on every machine regardless of timezone.
 */
export function date(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  const day = parsed.getUTCDate();
  const month = MONTHS[parsed.getUTCMonth()];
  const year = parsed.getUTCFullYear();
  return `${day} ${month} ${year}`;
}
