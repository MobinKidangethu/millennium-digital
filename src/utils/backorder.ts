/**
 * Backorder math for the product detail "Add to Cart" flow.
 *
 * Rule: if a buyer orders more units than are currently in stock, the
 * in-stock quantity ships immediately and the remainder is treated as
 * back-ordered against the manufacturer's factory lead time — this should
 * apply consistently to every product, not just ones that happen to be low
 * stock at a given moment.
 *
 * Factory lead time itself isn't in products.json (no real ERP/supplier
 * lead-time feed exists yet), so it's derived deterministically per product
 * id — same seeded-hash approach already used for BOM sample quantities
 * (see pseudoQty in features/bom/service.ts) — so it's stable across
 * reloads instead of re-rolling on every render like Math.random() would.
 * This is PROTOTYPE/DEMO data, not a live factory/ERP feed.
 */

function pseudoRandom(seed: number, min: number, max: number): number {
  const span = max - min;
  return min + (((seed * 2654435761) % (span + 1)) + (span + 1)) % (span + 1);
}

/** Deterministic per-product factory lead time, in weeks (range: 2–16). */
export function getFactoryLeadTimeWeeks(productId: number): number {
  return pseudoRandom(productId, 2, 16);
}

export interface BackorderSplit {
  /** Units that can ship from current stock right away. */
  shipNow: number;
  /** Units beyond current stock that would be back-ordered. */
  backordered: number;
  /** True when any part of the order is back-ordered. */
  hasBackorder: boolean;
}

/** Splits a requested order quantity against current stock availability. */
export function computeBackorderSplit(quantity: number, availability: number): BackorderSplit {
  const stock = Math.max(0, availability || 0);
  const shipNow = Math.min(quantity, stock);
  const backordered = Math.max(0, quantity - stock);
  return { shipNow, backordered, hasBackorder: backordered > 0 };
}
