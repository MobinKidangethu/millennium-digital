import type { ComponentType } from 'react';
import type { ImageSourcePropType } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { PRODUCT_IMAGES } from '@/constants/productImages';
import { MANUFACTURER_LOGO_RASTER, MANUFACTURER_LOGO_SVG } from '@/constants/manufacturerLogos';
import { LINE_CARD_BRANDS } from '@/constants/lineCardBrands';
import { CATEGORY_ICONS } from '@/constants/categoryIcons';

/** Returns the require()'d image source for a product, or null if unmapped. */
export function resolveProductImage(imagePath: string): number | null {
  return PRODUCT_IMAGES[imagePath] ?? null;
}

export type ManufacturerLogo =
  | { kind: 'raster'; source: ImageSourcePropType }
  | { kind: 'svg'; Component: ComponentType<SvgProps> }
  | null;

/** Returns the logo for a manufacturer as a discriminated raster/svg result, or null if unmapped. */
export function resolveManufacturerLogo(manufacturerName: string): ManufacturerLogo {
  const key = manufacturerName.trim().toLowerCase();
  const raster = MANUFACTURER_LOGO_RASTER[key];
  if (raster) return { kind: 'raster', source: raster };
  const Svg = MANUFACTURER_LOGO_SVG[key];
  if (Svg) return { kind: 'svg', Component: Svg };
  // Fall back to the real hotlinked logo from Millennium's published line
  // card (src/constants/lineCardBrands.ts) for brands that don't have a
  // locally bundled asset yet — same source used on the Manufacturers page.
  const lineCardBrand = LINE_CARD_BRANDS.find((b) => b.name.trim().toLowerCase() === key);
  if (lineCardBrand) return { kind: 'raster', source: { uri: lineCardBrand.logoUrl } };
  return null;
}

/** Returns the SVG icon component for a category name, or null if unmapped. */
export function resolveCategoryIcon(categoryName: string): ComponentType<SvgProps> | null {
  return CATEGORY_ICONS[categoryName.trim().toLowerCase()] ?? null;
}

/** "Infineon Technologies" -> "IT" for the fallback manufacturer badge. */
export function manufacturerInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
