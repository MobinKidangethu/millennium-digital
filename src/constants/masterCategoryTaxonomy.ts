/**
 * Reference industry category taxonomy — sourced from Mouser.in's public
 * category pages (Semiconductors, Circuit Protection, Connectors), pasted
 * in by the client as "master data" for aligning our IA with an
 * industry-standard classification.
 *
 * IMPORTANT — what this is and isn't:
 * - This is REFERENCE/CLASSIFICATION data only (official subcategory names
 *   for organizing and labeling our existing catalog). It is NOT a source
 *   of products — we do not add, invent, or import any product records
 *   from it.
 * - Our actual product catalog remains assets/data/products.json. A
 *   subcategory below is only ever shown to a user if we have real
 *   products (by productType) that map to it — see
 *   PRODUCT_TYPE_TO_SUBCATEGORY below. Empty/zero-product branches (e.g.
 *   the whole "Circuit Protection" top-level category — we carry no
 *   products in that category today) are kept here for future reference
 *   but are not surfaced anywhere in the UI, to avoid dead-end browsing.
 * - Mouser's product counts (e.g. "657,760 products") describe Mouser's
 *   own live catalog, not ours, and are intentionally omitted below.
 */

export interface TaxonomyNode {
  name: string;
  slug: string;
}

export interface TaxonomyGroup {
  name: string;
  slug: string;
  children: TaxonomyNode[];
}

/** Top-level industry category name -> its reference subcategory groups. */
export const MASTER_CATEGORY_TAXONOMY: Record<string, TaxonomyGroup[]> = {
  'Evaluation Board': [
    {
      name: 'Discrete Semiconductors',
      slug: 'discrete-semiconductors',
      children: [
        { name: 'Diodes & Rectifiers', slug: 'diodes-rectifiers' },
        { name: 'Discrete & Power Modules', slug: 'discrete-power-modules' },
        { name: 'Thyristors', slug: 'thyristors' },
        { name: 'Transistors', slug: 'transistors' },
      ],
    },
    {
      name: 'Integrated Circuits - ICs',
      slug: 'integrated-circuits-ics',
      children: [
        { name: 'Amplifier ICs', slug: 'amplifier-ics' },
        { name: 'Data Converter ICs', slug: 'data-converter-ics' },
        { name: 'Driver ICs', slug: 'driver-ics' },
        { name: 'Embedded Processors & Controllers', slug: 'embedded-processors-controllers' },
        { name: 'Interface ICs', slug: 'interface-ics' },
        { name: 'Logic ICs', slug: 'logic-ics' },
        { name: 'Memory ICs', slug: 'memory-ics' },
        { name: 'Power Management ICs', slug: 'power-management-ics' },
        { name: 'Programmable Logic ICs', slug: 'programmable-logic-ics' },
        { name: 'Wireless & RF Integrated Circuits', slug: 'wireless-rf-integrated-circuits' },
      ],
    },
    {
      name: 'Wireless & RF Semiconductors',
      slug: 'wireless-rf-semiconductors',
      children: [
        { name: 'PIN Diodes', slug: 'pin-diodes' },
        { name: 'Transistors RF', slug: 'transistors-rf' },
        { name: 'Wireless & RF Integrated Circuits', slug: 'wireless-rf-integrated-circuits' },
      ],
    },
  ],
  Connectors: [
    {
      name: 'Connectors',
      slug: 'connectors',
      children: [
        { name: 'Automotive Connectors', slug: 'automotive-connectors' },
        { name: 'Board to Board & Mezzanine Connectors', slug: 'board-to-board-mezzanine-connectors' },
        { name: 'Cable Assemblies', slug: 'cable-assemblies' },
        { name: 'Circular Connectors', slug: 'circular-connectors' },
        { name: 'D-Sub Connectors', slug: 'd-sub-connectors' },
        { name: 'Headers & Wire Housings', slug: 'headers-wire-housings' },
        { name: 'Modular Connectors / Ethernet Connectors', slug: 'modular-connectors-ethernet-connectors' },
        { name: 'Pin & Socket Connectors', slug: 'pin-socket-connectors' },
        { name: 'Power Connectors', slug: 'power-connectors' },
        { name: 'RF Interconnects', slug: 'rf-interconnects' },
        { name: 'Terminal Blocks', slug: 'terminal-blocks' },
        { name: 'Terminals', slug: 'terminals' },
        { name: 'USB Connectors', slug: 'usb-connectors' },
        { name: 'Wire & Cable', slug: 'wire-cable' },
      ],
    },
  ],
  /**
   * No products in our catalog are tagged category "Circuit Protection"
   * today, so this branch is not wired into any page — kept as reference
   * for when/if such SKUs are added to products.json.
   */
  'Circuit Protection': [
    {
      name: 'Circuit Protection',
      slug: 'circuit-protection',
      children: [
        { name: 'Circuit Breakers & Accessories', slug: 'circuit-breakers-accessories' },
        { name: 'ESD Protection Diodes / TVS Diodes', slug: 'esd-protection-diodes-tvs-diodes' },
        { name: 'Fuses', slug: 'fuses' },
        { name: 'Fuse Holders', slug: 'fuse-holders' },
        { name: 'Gas Discharge Tubes - GDTs / Gas Plasma Arrestors', slug: 'gas-discharge-tubes-gdts-gas-plasma-arrestors' },
        { name: 'Resettable Fuses - PPTC', slug: 'resettable-fuses-pptc' },
        { name: 'Surge Protective Devices - SPD', slug: 'surge-protective-devices-spd' },
        { name: 'Thermal Cut-offs', slug: 'thermal-cutoffs' },
        { name: 'Thermistors', slug: 'thermistors' },
        { name: 'Thyristors', slug: 'thyristors' },
        { name: 'Varistors', slug: 'varistors' },
      ],
    },
  ],
};

/**
 * Maps a real productType value from products.json to its official
 * subcategory name in the taxonomy above. Only includes productType values
 * that actually occur in our catalog today — nothing invented. Types with
 * no confident industry-standard mapping (e.g. the generic "Electronic
 * Component" placeholder present on some records) are intentionally left
 * out; callers should fall back to showing the raw productType label.
 */
export const PRODUCT_TYPE_TO_SUBCATEGORY: Record<string, string> = {
  // Semiconductors > Discrete Semiconductors > Diodes & Rectifiers
  'Rectifiers': 'Diodes & Rectifiers',
  'Schottky Diodes & Rectifiers': 'Diodes & Rectifiers',
  'Zener Diodes': 'Diodes & Rectifiers',
  'SiC Schottky Diodes': 'Diodes & Rectifiers',
  'Bridge Rectifiers': 'Diodes & Rectifiers',
  // Semiconductors > Discrete Semiconductors > Transistors
  'MOSFETs': 'Transistors',
  'SiC MOSFETS': 'Transistors',
  'GaN FETs': 'Transistors',
  // Semiconductors > Discrete Semiconductors > Discrete & Power Modules
  'IGBTs': 'Discrete & Power Modules',
  'Discrete Semiconductor Modules': 'Discrete & Power Modules',
  // Connectors > Connectors > Headers & Wire Housings
  'Connector Housings': 'Headers & Wire Housings',
};

export function getMasterSubcategoryLabel(productType: string): string | null {
  return PRODUCT_TYPE_TO_SUBCATEGORY[productType] ?? null;
}
