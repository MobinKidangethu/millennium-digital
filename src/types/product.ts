export type ProductTag = 'new' | 'featured' | 'best-seller';

/**
 * Shape of a single record in assets/data/products.json.
 * Field names/types mirror the source file exactly — do not add fields
 * that aren't present in the data.
 */
export interface RawProduct {
  id: number;
  mouserPartNumber: string;
  manufacturerPartNumber: string;
  manufacturer: string;
  manufacturerLogo: string;
  title: string;
  description: string;
  datasheet: string;
  productUrl: string;
  availability: number;
  stockStatus: string;
  price: number;
  currency: string;
  rohs: boolean;
  rohsLabel: string;
  lifecycle: string;
  productType: string;
  technology: string;
  mountingStyle: string;
  package: string;
  quantity: number;
  category: string;
  stockType: string;
  image: string;
  tags: ProductTag[] | null;
}

/**
 * Product as used throughout the app: same fields as RawProduct, plus
 * a stable slug pair used for clean URLs and admin-created products
 * that aren't in the original JSON.
 */
export interface Product extends RawProduct {
  manufacturerSlug: string;
  partSlug: string;
  tags: ProductTag[];
  /** true once an admin-managed product has been unpublished */
  isPublished: boolean;
}

export interface Manufacturer {
  name: string;
  slug: string;
  productCount: number;
  disabled: boolean;
}

export interface Category {
  name: string;
  slug: string;
  productCount: number;
  disabled: boolean;
}

export type SortOption =
  | 'relevance'
  | 'price-asc'
  | 'price-desc'
  | 'part-number'
  | 'newest';

export interface ProductFilters {
  search?: string;
  category?: string[];
  manufacturer?: string[];
  productType?: string[];
  technology?: string[];
  mountingStyle?: string[];
  package?: string[];
  rohsOnly?: boolean;
  priceMin?: number;
  priceMax?: number;
  tags?: ProductTag[];
  sort?: SortOption;
}
