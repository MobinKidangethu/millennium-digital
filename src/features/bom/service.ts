import { delay } from '@/utils';
import { getProducts } from '@/features/products/service';
import type { BomLineItem, BomMatchResult, Product } from '@/types';

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

/** A curated real-catalog sample BOM used by the "Load Sample BOM" demo action. */
export const SAMPLE_BOM_TEXT = [
  '# Designator, Part Number, Qty',
  'Q1, IQE036N08NM6SCATMA1, 250',
  'Q2, SQJ461EP-T1_NE3, 500',
  'Q3, SQJ460EP-T1_NE3, 150',
  'D1, S07M-M3/H, 1000',
  'U1, MDX-CUSTOM-2201, 75',
].join('\n');

/**
 * The same sample BOM as a real, downloadable CSV file (opens directly in
 * Excel/Sheets) — used by the "Download Sample BOM" action so buyers have
 * an actual template to fill in and re-upload, not just a canned textarea.
 */
export const SAMPLE_BOM_CSV = [
  'Designator,Part Number,Quantity',
  'Q1,IQE036N08NM6SCATMA1,250',
  'Q2,SQJ461EP-T1_NE3,500',
  'Q3,SQJ460EP-T1_NE3,150',
  'D1,S07M-M3/H,1000',
  'U1,MDX-CUSTOM-2201,75',
].join('\n');

function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s,._-]/g, '');
}

function familyPrefix(s: string): string {
  return normalize(s).slice(0, 6);
}

export async function matchBomItems(lines: BomLineItem[]): Promise<BomMatchResult[]> {
  await delay(900);
  const catalog = await getProducts({});

  return lines.map((line): BomMatchResult => {
    const requestedNorm = normalize(line.requestedPartNumber);

    const exact = catalog.find(
      (p) => normalize(p.manufacturerPartNumber) === requestedNorm || normalize(p.mouserPartNumber) === requestedNorm,
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

    return { line, matchType: 'unmatched', alternatives: [], confidence: 0 };
  });
}

export function summarizeMatches(results: BomMatchResult[]) {
  return {
    total: results.length,
    exact: results.filter((r) => r.matchType === 'exact').length,
    alternative: results.filter((r) => r.matchType === 'alternative').length,
    unmatched: results.filter((r) => r.matchType === 'unmatched').length,
  };
}

export type { Product };
