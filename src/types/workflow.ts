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

export type BomMatchType = 'exact' | 'alternative' | 'unmatched';

export interface BomMatchResult {
  line: BomLineItem;
  matchType: BomMatchType;
  product?: Product;
  alternatives: Product[];
  confidence: number;
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
export type RfqStatus = 'draft' | 'submitted' | 'quoted' | 'approved';

export interface RfqLineItem {
  productId: number;
  product: Product;
  quantity: number;
}

export interface Rfq {
  id: string;
  rfqNumber: string;
  source: RfqSource;
  status: RfqStatus;
  createdAt: string;
  lines: RfqLineItem[];
}

export interface PricingRuleStep {
  key: 'base' | 'volume' | 'supplier' | 'contract';
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
}

export interface DesignRequest extends DesignRequestInput {
  id: string;
  referenceNumber: string;
  submittedAt: string;
  status: DesignRequestStatus;
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
