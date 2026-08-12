import type { AppliedPromotion, Promotion } from '@/types';

/**
 * PROTOTYPE / DEMO promotions engine.
 *
 * DEMO_PROMOTIONS and the discount math below are illustrative prototype
 * offers used to demonstrate a promo code flowing through the same
 * governed-pricing spirit described in the pricing governance flow
 * (Base Price → Rule → Approved Price) — they are NOT official Millennium
 * Digital commercial offers. A production PromotionService would source
 * active campaigns from a marketing/promotions platform (or the pricing
 * governance engine's promotion rule table) behind this same function
 * signature, with codes validated server-side rather than in the client.
 */

const round2 = (value: number): number => Math.round(value * 100) / 100;

export const DEMO_PROMOTIONS: Promotion[] = [
  {
    code: 'WELCOME10',
    title: 'Welcome Offer',
    description: '10% off your order, capped at ₹5,000 — for buyers new to Millennium Digital.',
    kind: 'percentage',
    value: 10,
    maxDiscount: 5000,
    badge: 'New Buyers',
  },
  {
    code: 'BULK500',
    title: 'Bulk Procurement Credit',
    description: 'Flat ₹500 off orders over ₹25,000 — for volume component orders.',
    kind: 'fixed',
    value: 500,
    minSubtotal: 25000,
    badge: 'Volume Orders (₹25,000+)',
  },
  {
    code: 'ENGTEAM5',
    title: 'Engineering Team Offer',
    description: '5% off orders over ₹10,000, capped at ₹2,000 — for active BOM & RFQ buyers.',
    kind: 'percentage',
    value: 5,
    minSubtotal: 10000,
    maxDiscount: 2000,
    badge: 'BOM & RFQ Buyers',
  },
];

/** All currently active demo promotions, as shown on the Account → Promotions page. */
export function getActivePromotions(): Promotion[] {
  return DEMO_PROMOTIONS;
}

export function findPromotionByCode(code: string): Promotion | undefined {
  const normalized = code.trim().toUpperCase();
  return DEMO_PROMOTIONS.find((p) => p.code === normalized);
}

export interface PromoEvaluation {
  ok: boolean;
  error?: string;
  applied?: AppliedPromotion;
}

/**
 * Validates a promo code against the current cart subtotal and returns the
 * discount to apply. Used identically by the cart page and the checkout
 * order summary so the same code produces the same discount everywhere in
 * the buyer journey.
 */
export function evaluatePromoCode(code: string, subtotal: number): PromoEvaluation {
  if (!code.trim()) {
    return { ok: false, error: 'Enter a promo code.' };
  }
  const promo = findPromotionByCode(code);
  if (!promo) {
    return { ok: false, error: 'That promo code isn’t valid.' };
  }
  if (promo.minSubtotal && subtotal < promo.minSubtotal) {
    return {
      ok: false,
      error: `Requires a cart subtotal of at least ₹${promo.minSubtotal.toLocaleString('en-IN')}.`,
    };
  }

  let discountAmount = promo.kind === 'percentage' ? subtotal * (promo.value / 100) : promo.value;
  if (promo.maxDiscount != null) discountAmount = Math.min(discountAmount, promo.maxDiscount);
  discountAmount = Math.min(round2(discountAmount), subtotal);

  return {
    ok: true,
    applied: { code: promo.code, title: promo.title, discountAmount },
  };
}
