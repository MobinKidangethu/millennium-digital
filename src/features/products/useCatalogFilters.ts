import { useMemo, useState } from 'react';
import type { Product, ProductFilters, SortOption } from '@/types';

type MultiFilterKey = 'category' | 'manufacturer' | 'productType' | 'technology' | 'mountingStyle' | 'package';

export function useCatalogFilters(initial: ProductFilters = {}) {
  const [filters, setFilters] = useState<ProductFilters>(initial);

  const toggleValue = (key: MultiFilterKey, value: string) => {
    setFilters((prev) => {
      const current = prev[key] ?? [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [key]: next.length ? next : undefined };
    });
  };

  const setRohsOnly = (value: boolean) => setFilters((prev) => ({ ...prev, rohsOnly: value || undefined }));
  const setSort = (sort: SortOption) => setFilters((prev) => ({ ...prev, sort }));
  const setSearch = (search: string) => setFilters((prev) => ({ ...prev, search: search || undefined }));
  const setPriceRange = (priceMin?: number, priceMax?: number) =>
    setFilters((prev) => ({ ...prev, priceMin, priceMax }));
  const setMinAvailability = (minAvailability?: number) => setFilters((prev) => ({ ...prev, minAvailability }));

  const clearAll = () => setFilters({ sort: filters.sort, search: filters.search });

  const activeFilterCount = useMemo(() => {
    let count = 0;
    (['category', 'manufacturer', 'productType', 'technology', 'mountingStyle', 'package'] as const).forEach(
      (key) => {
        count += filters[key]?.length ?? 0;
      },
    );
    if (filters.rohsOnly) count += 1;
    if (filters.priceMin != null || filters.priceMax != null) count += 1;
    if (filters.minAvailability != null) count += 1;
    if (filters.tags?.length) count += filters.tags.length;
    return count;
  }, [filters]);

  return {
    filters,
    setFilters,
    toggleValue,
    setRohsOnly,
    setSort,
    setSearch,
    setPriceRange,
    setMinAvailability,
    clearAll,
    activeFilterCount,
  };
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

function buildOptions(products: Product[], key: keyof Product): FilterOption[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    const value = p[key] as unknown as string;
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count);
}

export function buildFilterOptionSets(products: Product[]) {
  return {
    category: buildOptions(products, 'category'),
    manufacturer: buildOptions(products, 'manufacturer'),
    productType: buildOptions(products, 'productType'),
    technology: buildOptions(products, 'technology').filter((o) => o.value.trim()),
    mountingStyle: buildOptions(products, 'mountingStyle'),
    package: buildOptions(products, 'package'),
    priceMin: products.length ? Math.min(...products.map((p) => p.price)) : 0,
    priceMax: products.length ? Math.max(...products.map((p) => p.price)) : 0,
  };
}
