import { delay, slugify } from '@/utils';
import { useCatalogMetaStore } from '@/state/catalogMetaStore';
import type { Manufacturer, Category, Product, ProductFilters } from '@/types';
import * as repository from './repository';

function matchesSearch(product: Product, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    product.manufacturerPartNumber,
    product.mouserPartNumber,
    product.title,
    product.manufacturer,
    product.productType,
    product.category,
    product.technology,
    product.package,
    product.description,
  ]
    .filter(Boolean)
    .some((field) => field.toLowerCase().includes(q));
}

function applyFilters(list: Product[], filters: ProductFilters): Product[] {
  let result = list;

  if (filters.search) {
    result = result.filter((p) => matchesSearch(p, filters.search!));
  }
  if (filters.category?.length) {
    result = result.filter((p) => filters.category!.includes(p.category));
  }
  if (filters.manufacturer?.length) {
    result = result.filter((p) => filters.manufacturer!.includes(p.manufacturer));
  }
  if (filters.productType?.length) {
    result = result.filter((p) => filters.productType!.includes(p.productType));
  }
  if (filters.technology?.length) {
    result = result.filter((p) => filters.technology!.includes(p.technology));
  }
  if (filters.mountingStyle?.length) {
    result = result.filter((p) => filters.mountingStyle!.includes(p.mountingStyle));
  }
  if (filters.package?.length) {
    result = result.filter((p) => filters.package!.includes(p.package));
  }
  if (filters.rohsOnly) {
    result = result.filter((p) => p.rohs);
  }
  if (filters.priceMin != null) {
    result = result.filter((p) => p.price >= filters.priceMin!);
  }
  if (filters.priceMax != null) {
    result = result.filter((p) => p.price <= filters.priceMax!);
  }
  if (filters.tags?.length) {
    result = result.filter((p) => filters.tags!.some((tag) => p.tags.includes(tag)));
  }

  return sortProducts(result, filters.sort ?? 'relevance');
}

function sortProducts(list: Product[], sort: ProductFilters['sort']): Product[] {
  const sorted = [...list];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'part-number':
      return sorted.sort((a, b) => a.manufacturerPartNumber.localeCompare(b.manufacturerPartNumber));
    case 'newest':
      return sorted.sort((a, b) => b.id - a.id);
    default:
      return sorted;
  }
}

function publishedOnly(list: Product[]): Product[] {
  return list.filter((p) => p.isPublished);
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const all = await repository.getAllProducts();
  await delay();
  return applyFilters(publishedOnly(all), filters);
}

/** Admin-only: includes unpublished products, for the product management table. */
export async function getProductsAdmin(filters: ProductFilters = {}): Promise<Product[]> {
  const all = await repository.getAllProducts();
  await delay();
  return applyFilters(all, filters);
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const product = await repository.getProductById(id);
  await delay();
  return product?.isPublished ? product : undefined;
}

/** Admin-only: returns a product regardless of publish state, for edit/preview screens. */
export async function getProductByIdAdmin(id: number): Promise<Product | undefined> {
  await delay();
  return repository.getProductById(id);
}

export async function getProductBySlug(
  manufacturerSlug: string,
  partSlug: string,
): Promise<Product | undefined> {
  const product = await repository.getProductBySlug(manufacturerSlug, partSlug);
  await delay();
  return product?.isPublished ? product : undefined;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return getProducts({ tags: ['featured'] });
}

export async function getBestSellingProducts(): Promise<Product[]> {
  return getProducts({ tags: ['best-seller'] });
}

export async function getNewProducts(): Promise<Product[]> {
  return getProducts({ tags: ['new'] });
}

export async function getRelatedProducts(product: Product, limit = 6): Promise<Product[]> {
  const all = publishedOnly(await repository.getAllProducts());
  await delay(200);
  return all
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.productType === product.productType || p.manufacturer === product.manufacturer),
    )
    .slice(0, limit);
}

export async function getManufacturers(options: { includeDisabled?: boolean } = {}): Promise<Manufacturer[]> {
  const all = publishedOnly(await repository.getAllProducts());
  await delay(200);
  const disabled = useCatalogMetaStore.getState().disabledManufacturers;
  const counts = new Map<string, number>();
  for (const p of all) {
    counts.set(p.manufacturer, (counts.get(p.manufacturer) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, productCount]) => ({ name, slug: slugify(name), productCount, disabled: disabled.includes(name) }))
    .filter((m) => options.includeDisabled || !m.disabled)
    .sort((a, b) => b.productCount - a.productCount);
}

export async function getManufacturerBySlug(slug: string): Promise<Manufacturer | undefined> {
  const manufacturers = await getManufacturers({ includeDisabled: true });
  return manufacturers.find((m) => m.slug === slug);
}

export async function getCategories(options: { includeDisabled?: boolean } = {}): Promise<Category[]> {
  const all = publishedOnly(await repository.getAllProducts());
  await delay(200);
  const disabled = useCatalogMetaStore.getState().disabledCategories;
  const counts = new Map<string, number>();
  for (const p of all) {
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, productCount]) => ({ name, slug: slugify(name), productCount, disabled: disabled.includes(name) }))
    .filter((c) => options.includeDisabled || !c.disabled)
    .sort((a, b) => b.productCount - a.productCount);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const categories = await getCategories({ includeDisabled: true });
  return categories.find((c) => c.slug === slug);
}

export async function getProductTypes(): Promise<string[]> {
  const all = publishedOnly(await repository.getAllProducts());
  return Array.from(new Set(all.map((p) => p.productType))).sort();
}

export { repository };
