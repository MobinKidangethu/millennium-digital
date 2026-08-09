import { delay } from '@/utils';
import { getProducts } from '@/features/products/service';
import type { AiCriteria, AiSearchResult, Product } from '@/types';

/**
 * PROTOTYPE / DEMO AI Engineering Search.
 *
 * This is a rule-based mock that stands in for a real NLU/AI service. It
 * only extracts criteria the current product catalog can actually answer
 * (manufacturer, product type, technology, mounting style, RoHS,
 * availability, price) — see src/types/product.ts for the full field list.
 * Anything the query mentions that the catalog has no structured field for
 * (e.g. a voltage/current rating, an automotive qualification) is surfaced
 * honestly in `unsupported` rather than silently ignored or invented.
 *
 * TARGET PRODUCTION ARCHITECTURE: this function's signature is designed so
 * it can be swapped for a call to a real AI/NLU platform (e.g. an LLM
 * function-calling endpoint) that returns the same AiCriteria shape —
 * nothing in the UI layer would need to change.
 */

const PRODUCT_TYPE_KEYWORDS: { pattern: RegExp; value: string }[] = [
  { pattern: /\bmosfets?\b/i, value: 'MOSFETs' },
  { pattern: /\bigbts?\b/i, value: 'IGBTs' },
  { pattern: /\bgan\s*fets?\b/i, value: 'GaN FETs' },
  { pattern: /\bschottky\b/i, value: 'Schottky Diodes & Rectifiers' },
  { pattern: /\bzener\b/i, value: 'Zener Diodes' },
  { pattern: /\bbridge\s*rectifiers?\b/i, value: 'Bridge Rectifiers' },
  { pattern: /\brectifiers?\b/i, value: 'Rectifiers' },
  { pattern: /\binductors?\b/i, value: 'Inductors' },
  { pattern: /\bcapacitors?\b/i, value: 'Capacitors' },
  { pattern: /\bevaluation\s*boards?\b/i, value: 'Evaluation Boards' },
];

const TECHNOLOGY_KEYWORDS: { pattern: RegExp; value: string }[] = [
  { pattern: /\bsic\b|silicon\s*carbide/i, value: 'SiC' },
  { pattern: /\bgan\b|gallium\s*nitride/i, value: 'GaN' },
];

const MOUNTING_KEYWORDS: { pattern: RegExp; value: string }[] = [
  { pattern: /\bsmd\b|\bsmt\b|surface\s*mount/i, value: 'SMD/SMT' },
  { pattern: /\bthrough\s*hole\b|\btht\b/i, value: 'Through Hole' },
  { pattern: /\bchassis\s*mount\b/i, value: 'Chassis Mount' },
  { pattern: /\bpanel\s*mount\b/i, value: 'Panel Mount' },
];

const KNOWN_MANUFACTURERS = [
  'Infineon Technologies',
  'Vishay Semiconductors',
  'Vishay',
  'Melexis',
  'Littelfuse',
  'Toshiba',
  'Renesas Electronics',
  'Qorvo',
  'IXYS',
  'Hartland Controls',
  'TE Connectivity',
  'Analog Devices',
];

const APPLICATION_HINTS = ['automotive', 'industrial', 'consumer', 'telecom', 'medical', 'aerospace', 'ev', 'solar'];

const UNSUPPORTED_PATTERNS: { pattern: RegExp; label: (m: RegExpMatchArray) => string }[] = [
  { pattern: /(\d+(?:\.\d+)?)\s*v(?:olts?)?\b/i, label: (m) => `${m[1]}V voltage rating` },
  { pattern: /(\d+(?:\.\d+)?)\s*a(?:mps?)?\b/i, label: (m) => `${m[1]}A current rating` },
  { pattern: /rds\s*\(?on\)?/i, label: () => 'RDS(on) threshold' },
  { pattern: /aec-?q\d*/i, label: () => 'AEC-Q automotive qualification grade' },
];

function extractStopwords(query: string, consumed: string[]): string[] {
  const stop = new Set([
    'a', 'an', 'the', 'find', 'me', 'for', 'with', 'and', 'in', 'of', 'suitable', 'available', 'availability',
    'above', 'over', 'under', 'below', 'package', 'need', 'looking', 'low', 'high', 'to',
  ]);
  const consumedLower = consumed.join(' ').toLowerCase();
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w) && !consumedLower.includes(w));
}

export function parseEngineeringQuery(query: string): AiCriteria {
  const consumed: string[] = [];
  const unsupported: string[] = [];

  const productType = PRODUCT_TYPE_KEYWORDS.find((k) => k.pattern.test(query));
  if (productType) consumed.push(productType.value);

  const technology = TECHNOLOGY_KEYWORDS.find((k) => k.pattern.test(query));
  if (technology) consumed.push(technology.value);

  const mountingStyle = MOUNTING_KEYWORDS.find((k) => k.pattern.test(query));
  if (mountingStyle) consumed.push(mountingStyle.value);

  const manufacturer = KNOWN_MANUFACTURERS.find((name) =>
    query.toLowerCase().includes(name.toLowerCase().split(' ')[0]),
  );
  if (manufacturer) consumed.push(manufacturer);

  const rohsOnly = /\brohs\b/i.test(query) || undefined;

  let minAvailability: number | undefined;
  const availabilityMatch = query.match(/(?:availability|stock|quantity)?\s*(?:above|over|more than|greater than)\s*(\d+)/i);
  if (availabilityMatch) minAvailability = Number(availabilityMatch[1]);

  let maxPrice: number | undefined;
  const priceMatch = query.match(/(?:under|below|less than)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
  if (priceMatch) maxPrice = Number(priceMatch[1]);

  const applicationHint = APPLICATION_HINTS.find((a) => query.toLowerCase().includes(a));

  for (const u of UNSUPPORTED_PATTERNS) {
    const m = query.match(u.pattern);
    if (m) unsupported.push(u.label(m));
  }

  const keywords = extractStopwords(query, consumed);

  return {
    keywords,
    productType: productType?.value,
    technology: technology?.value,
    mountingStyle: mountingStyle?.value,
    manufacturer,
    rohsOnly,
    minAvailability,
    maxPrice,
    applicationHint,
    unsupported,
  };
}

function scoreProduct(product: Product, criteria: AiCriteria): number {
  let score = 0;
  if (criteria.productType && product.productType.toLowerCase().includes(criteria.productType.toLowerCase())) score += 4;
  if (criteria.technology && product.technology === criteria.technology) score += 3;
  if (criteria.mountingStyle && product.mountingStyle === criteria.mountingStyle) score += 2;
  if (criteria.manufacturer && product.manufacturer.toLowerCase().includes(criteria.manufacturer.toLowerCase().split(' ')[0])) score += 3;
  if (criteria.rohsOnly && product.rohs) score += 1;
  if (criteria.minAvailability != null && product.availability >= criteria.minAvailability) score += 2;
  if (criteria.maxPrice != null && product.price <= criteria.maxPrice) score += 2;

  const haystack = `${product.title} ${product.description} ${product.manufacturerPartNumber} ${product.category}`.toLowerCase();
  for (const kw of criteria.keywords) {
    if (haystack.includes(kw)) score += 1;
  }
  return score;
}

function buildExplanation(query: string, criteria: AiCriteria, matchCount: number): string {
  const parts: string[] = [];
  if (criteria.productType) parts.push(`product type "${criteria.productType}"`);
  if (criteria.technology) parts.push(`"${criteria.technology}" technology`);
  if (criteria.mountingStyle) parts.push(`"${criteria.mountingStyle}" mounting`);
  if (criteria.manufacturer) parts.push(`manufacturer "${criteria.manufacturer}"`);
  if (criteria.rohsOnly) parts.push('RoHS compliance');
  if (criteria.minAvailability != null) parts.push(`availability above ${criteria.minAvailability} units`);
  if (criteria.maxPrice != null) parts.push(`price under ${criteria.maxPrice}`);

  let text =
    parts.length > 0
      ? `Interpreted "${query}" as: ${parts.join(', ')}. Found ${matchCount} matching product${matchCount === 1 ? '' : 's'} in the current catalog, ranked by relevance.`
      : `Couldn't map "${query}" to a structured catalog attribute — showing the closest keyword matches instead.`;

  if (criteria.applicationHint) {
    text += ` Note: "${criteria.applicationHint}" application context was noted but isn't a filterable catalog attribute in this prototype — a production catalog with qualification/certification metadata could filter on it directly.`;
  }
  if (criteria.unsupported.length) {
    text += ` Requirement(s) not yet structured in the product data: ${criteria.unsupported.join(', ')} — these would come from parametric datasheet attributes in a production catalog.`;
  }
  return text;
}

export async function runAiSearch(query: string): Promise<AiSearchResult> {
  await delay(600);
  const criteria = parseEngineeringQuery(query);
  const all = await getProducts({});

  const scored = all
    .map((product) => ({ product, score: scoreProduct(product, criteria) }))
    .filter((s) => s.score > 0 || (!criteria.productType && !criteria.technology && !criteria.manufacturer))
    .sort((a, b) => b.score - a.score || b.product.availability - a.product.availability);

  const matches = scored.slice(0, 12).map((s) => s.product);

  return {
    query,
    criteria,
    matches,
    explanation: buildExplanation(query, criteria, matches.length),
  };
}
