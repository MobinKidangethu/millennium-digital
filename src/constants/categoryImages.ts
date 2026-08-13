import { colors } from '@/design-system';

/**
 * Category name -> representative photo + accent color, keyed by
 * normalized (lowercased) category name as it appears in products.json.
 * Imagery is real photography sourced from Unsplash (free license,
 * verified working URLs), the same sourcing pattern already used in
 * SegmentCarousel.tsx — not photography of actual client inventory, and
 * not AI-generated. Each entry gets a distinct accent drawn from the
 * existing brand palette (plum/teal/green/amber families) so the
 * category grid reads as colorful without introducing new hues outside
 * the design system.
 */
export interface CategoryVisual {
  imageUrl: string;
  accent: string;
}

export const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  'evaluation board': {
    imageUrl: 'https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&w=800&q=80',
    accent: colors.plum[600],
  },
  power: {
    imageUrl: 'https://images.unsplash.com/photo-1693013112835-5f3128bb555f?auto=format&fit=crop&w=800&q=80',
    accent: colors.amber[600],
  },
  sensors: {
    imageUrl: 'https://images.unsplash.com/photo-1614903755064-c8b552516701?auto=format&fit=crop&w=800&q=80',
    accent: colors.teal[500],
  },
  'tools & supplies': {
    imageUrl: 'https://images.unsplash.com/photo-1745449064670-94bd0fc13df8?auto=format&fit=crop&w=800&q=80',
    accent: colors.gray[700],
  },
  'passive components': {
    imageUrl: 'https://images.unsplash.com/photo-1586256053828-a36b572ab01d?auto=format&fit=crop&w=800&q=80',
    accent: colors.plum[400],
  },
  'wire & cable': {
    imageUrl: 'https://images.unsplash.com/photo-1518181835702-6eef8b4b2113?auto=format&fit=crop&w=800&q=80',
    accent: colors.teal[700],
  },
  connectors: {
    imageUrl: 'https://images.unsplash.com/photo-1745847768408-b7b83796cae6?auto=format&fit=crop&w=800&q=80',
    accent: colors.green[500],
  },
  'embedded solutions': {
    imageUrl: 'https://images.unsplash.com/photo-1684430598817-0c77ec7babfd?auto=format&fit=crop&w=800&q=80',
    accent: colors.plum[800],
  },
};

const DEFAULT_ACCENT = colors.brand.primary;

export function resolveCategoryVisual(categoryName: string): CategoryVisual {
  const key = categoryName.trim().toLowerCase();
  return CATEGORY_VISUALS[key] ?? { imageUrl: '', accent: DEFAULT_ACCENT };
}
