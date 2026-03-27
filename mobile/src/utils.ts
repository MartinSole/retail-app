import type { CartLine } from "./types";

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatTimestamp(isoOrMillis: string | number): string {
  const date = typeof isoOrMillis === "number" ? new Date(isoOrMillis) : new Date(isoOrMillis);
  return date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export function subtotalFromLines(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
}
