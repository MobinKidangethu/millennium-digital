import AsyncStorage from '@react-native-async-storage/async-storage';
import rawProducts from '../../../assets/data/products.json';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { slugify } from '@/utils';
import type { Product, RawProduct } from '@/types';

function toProduct(raw: RawProduct): Product {
  return {
    ...raw,
    tags: raw.tags ?? [],
    manufacturerSlug: slugify(raw.manufacturer),
    partSlug: slugify(raw.manufacturerPartNumber),
    isPublished: true,
  };
}

const baseProducts: Product[] = (rawProducts as RawProduct[]).map(toProduct);

let products: Product[] = [...baseProducts];
let maxId = products.reduce((max, p) => Math.max(max, p.id), 0);
let initPromise: Promise<void> | null = null;

async function persistOverrides(): Promise<void> {
  // Only persist products that differ from (or don't exist in) the base
  // catalog, keyed by id, so a fresh base catalog update isn't clobbered
  // by stale full-array snapshots.
  const overrides: Record<number, Product> = {};
  const baseById = new Map(baseProducts.map((p) => [p.id, p]));
  for (const product of products) {
    const base = baseById.get(product.id);
    if (!base || JSON.stringify(base) !== JSON.stringify(product)) {
      overrides[product.id] = product;
    }
  }
  const deletedIds = baseProducts
    .filter((base) => !products.some((p) => p.id === base.id))
    .map((p) => p.id);

  await AsyncStorage.setItem(
    STORAGE_KEYS.productOverrides,
    JSON.stringify({ overrides, deletedIds }),
  );
}

async function ensureInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.productOverrides);
        if (!raw) return;
        const parsed = raw ? JSON.parse(raw) : null;
        const overrides: Record<string, Product> = parsed?.overrides ?? {};
        const deletedIds: number[] = parsed?.deletedIds ?? [];

        let merged = baseProducts.filter((p) => !deletedIds.includes(p.id));
        for (const override of Object.values(overrides)) {
          const idx = merged.findIndex((p) => p.id === override.id);
          if (idx >= 0) merged[idx] = override;
          else merged.push(override);
        }
        products = merged;
        maxId = products.reduce((max, p) => Math.max(max, p.id), 0);
      } catch {
        // Corrupt/unavailable local storage — fall back to the base catalog.
        products = [...baseProducts];
      }
    })();
  }
  return initPromise;
}

export async function getAllProducts(): Promise<Product[]> {
  await ensureInitialized();
  return products;
}

export async function getProductById(id: number): Promise<Product | undefined> {
  await ensureInitialized();
  return products.find((p) => p.id === id);
}

export async function getProductBySlug(
  manufacturerSlug: string,
  partSlug: string,
): Promise<Product | undefined> {
  await ensureInitialized();
  return products.find(
    (p) => p.manufacturerSlug === manufacturerSlug && p.partSlug === partSlug,
  );
}

export async function upsertProduct(product: Omit<Product, 'id'> & { id?: number }): Promise<Product> {
  await ensureInitialized();
  const isNew = product.id == null;
  const id = isNew ? ++maxId : product.id!;
  const full: Product = {
    ...product,
    id,
    manufacturerSlug: slugify(product.manufacturer),
    partSlug: slugify(product.manufacturerPartNumber),
  };
  const idx = products.findIndex((p) => p.id === id);
  if (idx >= 0) products[idx] = full;
  else products.push(full);
  await persistOverrides();
  return full;
}

export async function setProductPublished(id: number, isPublished: boolean): Promise<void> {
  await ensureInitialized();
  const idx = products.findIndex((p) => p.id === id);
  if (idx >= 0) {
    products[idx] = { ...products[idx], isPublished };
    await persistOverrides();
  }
}

export async function deleteProduct(id: number): Promise<void> {
  await ensureInitialized();
  products = products.filter((p) => p.id !== id);
  await persistOverrides();
}
