import type { Product } from './product';

/**
 * Types backing the B2B engineering workflows layered on top of the core
 * catalog: AI-assisted search, BOM intake/matching, RFQ & governed pricing,
 * and Maker-Checker governance. Every service that produces these types is
 * a MOCK / PROTOTYPE implementation (see each service file) designed so a
 * real backend (AI platform, ERP, pricing engine, PLM) can replace it
 * without UI changes — see PROTOTYPE vs PRODUCTION notes inline.
 */

// ---------------------------------------------------------------------------
// AI Engineering Search
// ---------------------------------------------------------------------------

export interface AiCriteria {
  /** Free-text tokens not mapped to a structured field, used for relevance scoring. */
  keywords: string[];
  productType?: string;
  technology?: string;
  mountingStyle?: string;
  manufacturer?: string;
  rohsOnly?: boolean;
  minAvailability?: number;
  maxPrice?: number;
  /** Non-catalog context (e.g. "automotive") kept for the explanation, not used as a filter. */
  applicationHint?: string;
  /** Requirement fragments the current dataset has no structured field for (e.g. a voltage rating). */
  unsupported: string[];
}

export interface AiSearchResult {
  query: string;
  criteria: AiCriteria;
  matches: Product[];
  /** True count of catalog products that qualified, before any display cap is applied. */
  totalMatches: number;
  /** Human-readable summary of how the query was interpreted. */
  explanation: string;
}

// ---------------------------------------------------------------------------
// BOM intake & component matching
// ---------------------------------------------------------------------------

export interface BomLineItem {
  id: string;
  lineNumber: number;
  designator?: string;
  requestedPartNumber: string;
  requestedManufacturer?: string;
  quantity: number;
  rawText: string;
}

export type BomMatchType = 'exact' | 'alternative' | 'ai-suggested' | 'unmatched';

/**
 * Buyer-controlled destination for a resolved BOM line: a straight catalog
 * buy that skips RFQ entirely and goes to cart/checkout as a normal order,
 * or a line that needs sales/procurement handling via the RFQ pipeline
 * (see src/constants/rfqLifecycle.ts). Defaulted by match type in
 * bomWorkflowStore.startBomResults, but always overridable per line.
 */
export type BomLineRouting = 'order' | 'rfq';

export interface BomMatchResult {
  line: BomLineItem;
  matchType: BomMatchType;
  product?: Product;
  alternatives: Product[];
  confidence: number;
  /** Short human-readable explanation shown for 'ai-suggested' results — how the alternates were inferred. */
  matchReason?: string;
}

export interface Bom {
  id: string;
  fileName: string;
  createdAt: string;
  lines: BomLineItem[];
}

// ---------------------------------------------------------------------------
// RFQ & Quote
// ---------------------------------------------------------------------------

export type RfqSource = 'bom' | 'ai-search' | 'manual' | 'cart';

/**
 * Full RFQ fulfillment lifecycle — from buyer submission through two buyer
 * approval gates (quote approval, then shipment approval) with internal
 * sales/procurement handling in between, ending in its own shipment/delivery
 * tracking. See src/constants/rfqLifecycle.ts for the single ordered source
 * of truth used by every stepper/badge/admin control that renders this
 * status, including which stages are buyer-driven vs. admin-driven.
 */
export type RfqStatus =
  | 'submitted'
  | 'customer_approval'
  | 'product_identification'
  | 'procurement'
  | 'ready_to_ship'
  | 'shipment_approved'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface RfqTimelineEntry {
  status: RfqStatus;
  label: string;
  timestamp: string;
}

export interface RfqLineItem {
  productId: number;
  product: Product;
  quantity: number;
  /**
   * Buyer-entered approximate unit price for a BOM line where an AI
   * alternative/new-design match was routed to RFQ instead of Normal Order
   * (see app/(buyer)/bom/index.tsx) — since no specific catalog SKU was
   * confirmed, the quote is built from this target price (see
   * computeCustomerTargetPricing in src/features/pricing/service.ts)
   * instead of governed catalog pricing, pending sales identifying the
   * exact part. `product` still carries a representative catalog item
   * (the closest AI match) for display purposes only.
   */
  targetUnitPrice?: number;
}

export interface Rfq {
  id: string;
  rfqNumber: string;
  source: RfqSource;
  status: RfqStatus;
  timeline: RfqTimelineEntry[];
  createdAt: string;
  lines: RfqLineItem[];
  /**
   * Fulfillment details captured on the dedicated RFQ Cart/Checkout journey
   * (app/(buyer)/rfq-cart, app/(buyer)/rfq-checkout) once the buyer approves
   * shipment — deliberately separate from the normal buyer cart/checkout,
   * so an RFQ never touches useCartStore/useCheckoutStore. Present once
   * status reaches 'processing' or later.
   */
  shippingAddress?: import('./user').Address;
  billingAddress?: import('./user').Address;
  shippingMethod?: import('./order').ShippingMethodOption;
  paymentMethod?: import('./order').PaymentMethodSelection;
}

export interface PricingRuleStep {
  key: 'base' | 'volume' | 'supplier' | 'contract' | 'customer_target';
  label: string;
  description: string;
  /** Resulting unit price after this step is applied. */
  unitPriceAfter: number;
  /** Percentage delta applied at this step (negative = discount). Null for the base step. */
  deltaPct: number | null;
}

export interface PricingBreakdown {
  productId: number;
  currency: string;
  quantity: number;
  baseUnitPrice: number;
  steps: PricingRuleStep[];
  approvedUnitPrice: number;
  approvedLineTotal: number;
}

export interface QuoteLine {
  productId: number;
  product: Product;
  quantity: number;
  pricing: PricingBreakdown;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  rfqId: string;
  createdAt: string;
  validUntil: string;
  lines: QuoteLine[];
  currency: string;
  subtotal: number;
}

// ---------------------------------------------------------------------------
// Governance (Maker / Checker)
// ---------------------------------------------------------------------------

export type GovernanceStage =
  | 'draft'
  | 'submitted'
  | 'maker_validated'
  | 'checker_validated'
  | 'business_approved'
  | 'published';

export type GovernanceEntityType = 'product' | 'pricing' | 'supplier' | 'release';

export interface GovernanceHistoryEntry {
  stage: GovernanceStage;
  actor: string;
  timestamp: string;
  note?: string;
}

export interface GovernanceRecord {
  entityType: GovernanceEntityType;
  entityId: string;
  stage: GovernanceStage;
  history: GovernanceHistoryEntry[];
}

// ---------------------------------------------------------------------------
// Design Request
// ---------------------------------------------------------------------------

export type DesignRequestStatus = 'submitted' | 'engineering_review' | 'scoped' | 'quoted';

export interface DesignRequestInput {
  projectName: string;
  application: string;
  technicalRequirement: string;
  targetQuantity: string;
  targetCost?: string;
  requiredDate?: string;
  bomFileName?: string;
  additionalRequirements?: string;
  contactName?: string;
  contactEmail?: string;
  /** Set when this request was launched from a BOM line's "Submit Design Request" action, so it can be traced back. */
  sourceBomLineId?: string;
  sourcePartNumber?: string;
  sourceDesignator?: string;
}

export interface DesignRequest extends DesignRequestInput {
  id: string;
  referenceNumber: string;
  submittedAt: string;
  status: DesignRequestStatus;
}

/**
 * Links a submitted Design Request back to the BOM line that raised it.
 * Kept in bomWorkflowStore (not on the BomMatchResult itself, which is
 * regenerated fresh each time a BOM is processed) so the BOM results screen
 * can mark that line "Design Request Uploaded" and keep it out of the
 * cart/RFQ flow, even after navigating away to the Design Request form and
 * back.
 */
export interface BomDesignRequestLink {
  lineId: string;
  partNumber: string;
  designator?: string;
  requestId: string;
  referenceNumber: string;
  status: DesignRequestStatus;
  submittedAt: string;
}

/**
 * Links a BOM line that was routed to RFQ back to the RFQ it was submitted
 * in — same purpose as BomDesignRequestLink above, but for the RFQ path.
 * Kept in bomWorkflowStore so the BOM results screen can mark that line
 * "RFQ Submitted" (with a link to its fulfillment tracker) instead of
 * re-showing the routing controls, even after navigating away and back.
 */
export interface BomRfqSubmissionLink {
  lineId: string;
  rfqId: string;
  rfqNumber: string;
  submittedAt: string;
}

// ---------------------------------------------------------------------------
// Seller / Supplier onboarding
// ---------------------------------------------------------------------------

export type SellerBusinessType = 'Manufacturer' | 'Authorized Distributor' | 'Trading Company' | 'Other';

export type SellerApplicationStatus = 'submitted' | 'verification' | 'catalogue_setup' | 'console_access';

export interface SellerApplicationInput {
  companyName: string;
  businessType: SellerBusinessType;
  registrationNumber: string;
  contactName: string;
  email: string;
  phone: string;
  categories: string[];
  monthlyVolume?: string;
  city: string;
  state: string;
  country: string;
}

export interface SellerApplication extends SellerApplicationInput {
  id: string;
  referenceNumber: string;
  submittedAt: string;
  status: SellerApplicationStatus;
}
