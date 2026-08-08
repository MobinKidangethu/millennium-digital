import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';
import { PRODUCT_IMAGES } from '@/constants/productImages';
import { MANUFACTURER_LOGOS } from '@/constants/manufacturerLogos';
import { CATEGORY_ICONS } from '@/constants/categoryIcons';

/** Returns the require()'d image source for a product, or null if unmapped. */
export function resolveProductImage(imagePath: string): number | null {
  return PRODUCT_IMAGES[imagePath] ?? null;
}

/** Returns the logo source (raster asset id or SVG component) for a manufacturer, or null if unmapped. */
export function resolveManufacturerLogo(
  manufacturerName: string,
): number | ComponentType<SvgProps> | null {
  return MANUFACTURER_LOGOS[manufacturerName.trim().toLowerCase()] ?? null;
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
