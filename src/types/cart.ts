export interface CartItem {
  productId: number;
  quantity: number;
  addedAt: string;
}

export interface CartLineView {
  product: import('./product').Product;
  quantity: number;
  /** Effective per-unit price actually charged — catalog price, or the governed volume price for 100+ unit lines. */
  unitPrice: number;
  lineTotal: number;
  /** Present when quantity qualifies for governed volume pricing (>=100 units) — see pricingService.computeGovernedPricing. */
  governedPricing?: import('./workflow').PricingBreakdown;
}
