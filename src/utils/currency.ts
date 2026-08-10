import { formatPrice } from './formatPrice';

/**
 * Storefront display-currency conversion.
 *
 * Every product in products.json stores its price in INR (see the
 * `currency` field on each product) — that never changes. This module
 * only controls how prices are *displayed*, converting from a product's
 * native currency into whichever currency the shopper has selected via
 * the header currency switcher (see src/state/currencyStore.ts).
 *
 * PROTOTYPE: the rate below is a fixed constant for demo purposes, not a
 * live FX feed. Production target: replace RATE_TO_INR with a real-time
 * exchange-rate service behind this same convertAmount() interface —
 * nothing calling convertAmount()/formatDisplayPrice() would need to
 * change.
 */
const INR_PER_USD = 87;

const RATE_TO_INR: Record<string, number> = {
  INR: 1,
  USD: INR_PER_USD,
};

/** Converts `amount` from `fromCurrency` to `toCurrency` using the static demo rate table above. */
export function convertAmount(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount;
  const fromRate = RATE_TO_INR[fromCurrency] ?? 1;
  const toRate = RATE_TO_INR[toCurrency] ?? 1;
  return (amount * fromRate) / toRate;
}

/** Converts `amount` from its native currency to `displayCurrency` and formats it for display. */
export function formatDisplayPrice(amount: number, nativeCurrency: string, displayCurrency: string): string {
  return formatPrice(convertAmount(amount, nativeCurrency, displayCurrency), displayCurrency);
}
