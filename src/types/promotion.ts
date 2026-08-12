export type PromotionKind = 'percentage' | 'fixed';

/**
 * PROTOTYPE / DEMO promotion record — see src/features/promotions/service.ts
 * for the prototype-vs-production note. Not an official Millennium Digital
 * commercial offer.
 */
export interface Promotion {
  code: string;
  title: string;
  description: string;
  kind: PromotionKind;
  /** Percentage (0–100) for kind: 'percentage', or a flat currency amount for kind: 'fixed'. */
  value: number;
  /** Minimum cart subtotal (in INR, matching catalog currency) required to use this code. */
  minSubtotal?: number;
  /** Cap on the discount amount for percentage-based codes. */
  maxDiscount?: number;
  /** Demo-only expiry label shown in the UI — not enforced against a real clock unless set. */
  expiresAt?: string;
  /** Short eligibility tag shown on the promotions list, e.g. "New Buyers". */
  badge: string;
}

/** A promo code successfully evaluated against a cart subtotal. */
export interface AppliedPromotion {
  code: string;
  title: string;
  discountAmount: number;
}
