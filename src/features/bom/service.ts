import { delay } from '@/utils';
import { getProducts } from '@/features/products/service';
import rawCatalog from '../../../assets/data/products.json';
import type { BomLineItem, BomMatchResult, Product, RawProduct } from '@/types';

/**
 * PROTOTYPE / DEMO BOM intake + component matching.
 *
 * parseBomText is a lightweight line parser standing in for a real BOM
 * ingestion pipeline (CSV/XLSX/ODB++ parsing, column mapping, designator
 * grouping). matchBomItems matches parsed lines against the live product
 * catalog by part number, with a same-family fuzzy fallback for
 * alternative-match suggestions. A production BOMService would replace
 * both with a real parser + a component-matching/alternative-part API
 * behind this same shape.
 */

let lineCounter = 0;

export function parseBomText(raw: string): BomLineItem[] {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  return lines.map((raw): BomLineItem => {
    // Accepts "Designator, PartNumber, Qty" / "PartNumber, Qty" / "PartNumber x Qty" / bare "PartNumber"
    const cells = raw.split(',').map((c) => c.trim()).filter(Boolean);
    let designator: string | undefined;
    let partNumber: string;
    let qtyToken: string | undefined;

    if (cells.length >= 3) {
      [designator, partNumber, qtyToken] = cells;
    } else if (cells.length === 2) {
      [partNumber, qtyToken] = cells;
    } else {
      const xMatch = raw.match(/^(.*?)\s*[xX×]\s*(\d+)$/);
      if (xMatch) {
        partNumber = xMatch[1].trim();
        qtyToken = xMatch[2];
      } else {
        partNumber = cells[0] ?? raw;
      }
    }

    const quantity = qtyToken ? Math.max(1, parseInt(qtyToken.replace(/[^\d]/g, ''), 10) || 1) : 1;

    return {
      id: `bom-line-${++lineCounter}`,
      lineNumber: lineCounter,
      designator,
      requestedPartNumber: partNumber.trim(),
      quantity,
      rawText: raw,
    };
  });
}

/**
 * Reference-designator prefix by rough component family, so the generated
 * sample BOM reads like a real engineering BOM export rather than a flat
 * list — matched loosely against each product's productType/category.
 */
function designatorPrefix(product: RawProduct): string {
  const t = `${product.productType} ${product.category}`.toLowerCase();
  if (t.includes('mosfet') || t.includes('igbt') || t.includes('transistor')) return 'Q';
  if (t.includes('diode') || t.includes('rectifier')) return 'D';
  if (t.includes('capacitor')) return 'C';
  if (t.includes('resistor')) return 'R';
  if (t.includes('inductor') || t.includes('wire') || t.includes('cable')) return 'L';
  if (t.includes('connector')) return 'J';
  if (t.includes('sensor')) return 'SEN';
  if (t.includes('tool') || t.includes('supplies')) return 'TL';
  return 'U';
}

/** Small deterministic (non-Math.random) pseudo-variety generator so the sample stays stable across reloads. */
function pseudoQty(seed: number, min: number, max: number): number {
  const span = max - min;
  return min + ((seed * 2654435761) % (span + 1) + (span + 1)) % (span + 1);
}

interface SampleLine {
  designator: string;
  partNumber: string;
  qty: number;
}

/**
 * Builds a large, realistic sample BOM straight from the live product
 * catalog (assets/data/products.json) — real manufacturer part numbers,
 * spread across categories/manufacturers rather than invented data. Sized
 * to demonstrate BOM → component-matching at real procurement scale
 * (100+ line items), not a 5-line toy example.
 *
 * A handful of lines are deliberately mutated (family-prefix match only)
 * or fully custom part numbers, so the matching demo also shows the
 * "alternative suggested" and "needs engineering review" states a real
 * BOM run would surface — not just 100% exact matches.
 */
function buildSampleBomLines(): SampleLine[] {
  const catalog = rawCatalog as RawProduct[];
  const sampleSize = Math.min(120, catalog.length);

  const exactLines: SampleLine[] = Array.from({ length: sampleSize }, (_, i) => {
    const product = catalog[Math.floor((i * catalog.length) / sampleSize)];
    const dCounts = designatorCounters;
    const prefix = designatorPrefix(product);
    dCounts[prefix] = (dCounts[prefix] ?? 0) + 1;
    return {
      designator: `${prefix}${dCounts[prefix]}`,
      partNumber: product.manufacturerPartNumber,
      qty: pseudoQty(product.id, 25, 1000),
    };
  });

  // Same-family fuzzy matches: real part numbers with a mutated suffix, so
  // matchBomItems() falls through to the alternative-match path.
  const alternativeSeeds = [catalog[3], catalog[41], catalog[88], catalog[130]].filter(Boolean);
  const alternativeLines: SampleLine[] = alternativeSeeds.map((product, i) => ({
    designator: `${designatorPrefix(product)}ALT${i + 1}`,
    partNumber: `${product.manufacturerPartNumber.slice(0, -2)}XX`,
    qty: pseudoQty(product.id + 7, 25, 500),
  }));

  // Fully custom part numbers with no catalog match — surfaces the
  // "needs engineering review / RFQ" path for a non-stock/custom component.
  const unmatchedLines: SampleLine[] = [
    { designator: 'U-NEW1', partNumber: 'MDX-CUSTOM-2201', qty: 75 },
    { designator: 'U-NEW2', partNumber: 'MDX-CUSTOM-3407', qty: 40 },
    { designator: 'U-NEW3', partNumber: 'MDX-CUSTOM-5190', qty: 120 },
  ];

  return [...exactLines, ...alternativeLines, ...unmatchedLines];
}

const designatorCounters: Record<string, number> = {};
const SAMPLE_LINES: SampleLine[] = buildSampleBomLines();

/**
 * A large, curated real-catalog sample BOM used by the "Load Sample BOM"
 * demo action — 100+ line items spanning the catalog, so the BOM →
 * component-matching → RFQ workflow demonstrates real procurement scale.
 */
export const SAMPLE_BOM_TEXT = [
  `# Designator, Part Number, Qty — ${SAMPLE_LINES.length} line items`,
  ...SAMPLE_LINES.map((l) => `${l.designator}, ${l.partNumber}, ${l.qty}`),
].join('\n');

/**
 * The same sample BOM as a real, downloadable CSV file (opens directly in
 * Excel/Sheets) — used by the "Download Sample BOM" action so buyers have
 * an actual template to fill in and re-upload, not just a canned textarea.
 */
export const SAMPLE_BOM_CSV = [
  'Designator,Part Number,Quantity',
  ...SAMPLE_LINES.map((l) => `${l.designator},${l.partNumber},${l.qty}`),
].join('\n');

function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s,._-]/g, '');
}

function familyPrefix(s: string): string {
  return normalize(s).slice(0, 6);
}

/**
 * Reverse of designatorPrefix() above: maps a reference-designator prefix
 * (the Designator column on an uploaded BOM — the same R/C/L/Q/D/J/U
 * convention real engineering BOMs use) to the catalog keywords it implies.
 * Lets a genuinely new/custom part (no exact or same-family match) still
 * get a sensible "closest available component" suggestion instead of a
 * dead end.
 */
const DESIGNATOR_CATEGORY_HINTS: { prefix: RegExp; keywords: string[] }[] = [
  { prefix: /^SEN/i, keywords: ['sensor'] },
  { prefix: /^TL/i, keywords: ['tool', 'program', 'evaluation'] },
  { prefix: /^Q/i, keywords: ['mosfet', 'igbt', 'transistor', 'fet', 'gan'] },
  { prefix: /^D/i, keywords: ['diode', 'rectifier', 'schottky', 'zener'] },
  { prefix: /^C/i, keywords: ['capacitor'] },
  { prefix: /^R/i, keywords: ['resistor'] },
  { prefix: /^L/i, keywords: ['inductor', 'wire', 'cable'] },
  { prefix: /^J/i, keywords: ['connector'] },
];

function inferKeywordsFromDesignator(designator?: string): string[] {
  if (!designator) return [];
  const hit = DESIGNATOR_CATEGORY_HINTS.find((h) => h.prefix.test(designator));
  return hit?.keywords ?? [];
}

/** Same deterministic seeded-hash approach used elsewhere in this file / utils/backorder.ts — stable across reloads, not Math.random(). */
function pseudoIndex(seed: number, length: number): number {
  if (length <= 0) return 0;
  return (((seed * 2654435761) % length) + length) % length;
}

/**
 * "AI Suggested Alternate" fallback for a BOM line with no exact or
 * same-family match — i.e. a part that genuinely isn't in the catalog
 * (a new/custom design). Infers a likely component category from the
 * line's reference-designator convention and ranks catalog products
 * against it; falls back to a deterministic catalog spread so a
 * suggestion is always returned rather than a dead end. A production
 * version would call a real component-recommendation model behind this
 * same shape.
 */
function findAiSuggestedAlternatives(line: BomLineItem, catalog: Product[]): { alternatives: Product[]; reason: string } {
  const keywords = inferKeywordsFromDesignator(line.designator);

  if (keywords.length > 0) {
    const scored = catalog
      .map((p) => {
        const haystack = `${p.productType} ${p.category} ${p.technology}`.toLowerCase();
        const score = keywords.reduce((s, kw) => s + (haystack.includes(kw) ? 1 : 0), 0);
        return { p, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score || b.p.availability - a.p.availability);

    if (scored.length > 0) {
      return {
        alternatives: scored.slice(0, 3).map((s) => s.p),
        reason: `Inferred a likely component type from designator "${line.designator}" — closest catalog matches shown.`,
      };
    }
  }

  // No designator hint (or nothing scored) — still surface a suggestion
  // rather than a dead end, spread deterministically across the catalog.
  const base = pseudoIndex(line.lineNumber * 97 + line.requestedPartNumber.length, catalog.length);
  const picks = [catalog[base], catalog[(base + 41) % catalog.length], catalog[(base + 83) % catalog.length]].filter(
    (p, i, arr): p is Product => !!p && arr.indexOf(p) === i,
  );
  return {
    alternatives: picks,
    reason: 'No catalog or family match, and no component-type hint on this line — showing the closest available parts for engineering review.',
  };
}

export async function matchBomItems(lines: BomLineItem[]): Promise<BomMatchResult[]> {
  await delay(900);
  const catalog = await getProducts({});

  return lines.map((line): BomMatchResult => {
    const requestedNorm = normalize(line.requestedPartNumber);

    const exact = catalog.find(
      (p) => normalize(p.manufacturerPartNumber) === requestedNorm || normalize(p.mdPartNumber) === requestedNorm,
    );
    if (exact) {
      return { line, matchType: 'exact', product: exact, alternatives: [], confidence: 1 };
    }

    const prefix = familyPrefix(line.requestedPartNumber);
    const alternatives = catalog
      .filter((p) => prefix.length >= 4 && familyPrefix(p.manufacturerPartNumber) === prefix)
      .slice(0, 4);

    if (alternatives.length > 0) {
      return { line, matchType: 'alternative', alternatives, confidence: 0.65 };
    }

    // Not in inventory at all, and no same-family part either — likely a
    // new/custom design. Rather than a dead end, offer an AI-suggested
    // closest-available alternate alongside the Design Request path (see
    // BomWorkflowContent's 'ai-suggested' card).
    if (catalog.length > 0) {
      const { alternatives: aiAlternatives, reason } = findAiSuggestedAlternatives(line, catalog);
      if (aiAlternatives.length > 0) {
        return { line, matchType: 'ai-suggested', alternatives: aiAlternatives, confidence: 0.35, matchReason: reason };
      }
    }

    return { line, matchType: 'unmatched', alternatives: [], confidence: 0 };
  });
}

export function summarizeMatches(results: BomMatchResult[]) {
  return {
    total: results.length,
    exact: results.filter((r) => r.matchType === 'exact').length,
    alternative: results.filter((r) => r.matchType === 'alternative').length,
    aiSuggested: results.filter((r) => r.matchType === 'ai-suggested').length,
    unmatched: results.filter((r) => r.matchType === 'unmatched').length,
  };
}

export type { Product };
