import { delay } from '@/utils';
import type { PricingBreakdown, PricingRuleStep, Product } from '@/types';

/**
 * PROTOTYPE / DEMO pricing governance engine.
 *
 * These volume/supplier/contract rates are illustrative demo rules used to
 * show the shape of a governed pricing flow — they are NOT official
 * Millennium Digital commercial terms. A production PricingService would
 * source these steps from an approved pricing rules engine / ERP contract
 * tables (see PROJECT governance section 15 — Pricing Governance) behind
 * this same function signature.
 */

/**
 * Minimum quantity (per line) that qualifies for governed volume pricing —
 * shared across the Cart page (applies the discount), the RFQ/Quote flow
 * (already uses this engine), and the checkout Payment step (100+ unit
 * lines route through Purchase Order only). Keep in sync with the lowest
 * non-zero VOLUME_BREAKS tier below.
 */
export const GOVERNED_PRICING_MIN_QTY = 100;

const VOLUME_BREAKS: { minQty: number; deltaPct: number; label: string }[] = [
  { minQty: 1000, deltaPct: -12, label: '1,000+ units' },
  { minQty: 500, deltaPct: -8, label: '500–999 units' },
  { minQty: 100, deltaPct: -4, label: '100–499 units' },
  { minQty: 0, deltaPct: 0, label: 'Under 100 units' },
];

const SUPPLIER_ADJUSTMENT_PCT = -1.5;
const CONTRACT_BUYER_PCT = -2;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export interface PricingOptions {
  /** Whether the requesting buyer has a registered contract rate on file. Demo flag. */
  contractBuyer?: boolean;
}

export function computeGovernedPricing(
  product: Product,
  quantity: number,
  options: PricingOptions = {},
): PricingBreakdown {
  const { contractBuyer = true } = options;
  const steps: PricingRuleStep[] = [];

  let unitPrice = product.price;
  steps.push({
    key: 'base',
    label: 'Base Price',
    description: 'Catalog list price from the product record.',
    unitPriceAfter: round2(unitPrice),
    deltaPct: null,
  });

  const volumeBreak = VOLUME_BREAKS.find((b) => quantity >= b.minQty)!;
  if (volumeBreak.deltaPct !== 0) {
    unitPrice = unitPrice * (1 + volumeBreak.deltaPct / 100);
  }
  steps.push({
    key: 'volume',
    label: 'Volume Pricing Rule',
    description: `Demo tier for ${volumeBreak.label}.`,
    unitPriceAfter: round2(unitPrice),
    deltaPct: volumeBreak.deltaPct,
  });

  unitPrice = unitPrice * (1 + SUPPLIER_ADJUSTMENT_PCT / 100);
  steps.push({
    key: 'supplier',
    label: 'Supplier Pricing Rule',
    description: `Demo supplier program adjustment for ${product.manufacturer}.`,
    unitPriceAfter: round2(unitPrice),
    deltaPct: SUPPLIER_ADJUSTMENT_PCT,
  });

  if (contractBuyer) {
    unitPrice = unitPrice * (1 + CONTRACT_BUYER_PCT / 100);
  }
  steps.push({
    key: 'contract',
    label: 'Contract / Customer Rule',
    description: contractBuyer
      ? 'Demo registered-buyer contract rate applied.'
      : 'No contract rate on file for this buyer — base rate carried forward.',
    unitPriceAfter: round2(unitPrice),
    deltaPct: contractBuyer ? CONTRACT_BUYER_PCT : 0,
  });

  const approvedUnitPrice = round2(unitPrice);

  return {
    productId: product.id,
    currency: product.currency,
    quantity,
    baseUnitPrice: product.price,
    steps,
    approvedUnitPrice,
    approvedLineTotal: round2(approvedUnitPrice * quantity),
  };
}

/**
 * Pricing path for BOM lines where the buyer routed an AI-suggested
 * alternative/new-design match to RFQ without confirming a specific
 * catalog SKU (see app/(buyer)/bom/index.tsx) — instead of running the
 * governed-pricing rule chain against a catalog product, the quote is
 * built directly from the buyer's own approximate target price, clearly
 * labeled as pending sales confirmation rather than an approved rate.
 */
export function computeCustomerTargetPricing(product: Product, quantity: number, targetUnitPrice: number): PricingBreakdown {
  const approvedUnitPrice = round2(targetUnitPrice);
  return {
    productId: product.id,
    currency: product.currency,
    quantity,
    baseUnitPrice: product.price,
    steps: [
      {
        key: 'customer_target',
        label: 'Customer Target Price',
        description: 'Your approximate price — pending sales team confirmation during RFQ review.',
        unitPriceAfter: approvedUnitPrice,
        deltaPct: null,
      },
    ],
    approvedUnitPrice,
    approvedLineTotal: round2(approvedUnitPrice * quantity),
  };
}

export async function getGovernedPricing(
  product: Product,
  quantity: number,
  options?: PricingOptions,
): Promise<PricingBreakdown> {
  await delay(250);
  return computeGovernedPricing(product, quantity, options);
}
