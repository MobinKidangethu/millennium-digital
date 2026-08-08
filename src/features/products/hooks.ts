import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Product, ProductFilters } from '@/types';
import * as service from './service';

export const productKeys = {
  all: ['products'] as const,
  list: (filters: ProductFilters) => ['products', 'list', filters] as const,
  detail: (id: number) => ['products', 'detail', id] as const,
  bySlug: (manufacturerSlug: string, partSlug: string) =>
    ['products', 'slug', manufacturerSlug, partSlug] as const,
  featured: ['products', 'featured'] as const,
  bestSellers: ['products', 'best-sellers'] as const,
  newArrivals: ['products', 'new'] as const,
  related: (id: number) => ['products', 'related', id] as const,
  manufacturers: ['manufacturers'] as const,
  manufacturer: (slug: string) => ['manufacturers', slug] as const,
  categories: ['categories'] as const,
  category: (slug: string) => ['categories', slug] as const,
  productTypes: ['product-types'] as const,
};

export function useProducts(filters: ProductFilters = {}, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => service.getProducts(filters),
    enabled: options.enabled,
  });
}

export function useProductsAdmin(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: [...productKeys.list(filters), 'admin'],
    queryFn: () => service.getProductsAdmin(filters),
  });
}

export function useProduct(id: number | undefined) {
  return useQuery({
    queryKey: productKeys.detail(id ?? -1),
    queryFn: () => service.getProductById(id!),
    enabled: id != null,
  });
}

export function useProductAdmin(id: number | undefined) {
  return useQuery({
    queryKey: [...productKeys.detail(id ?? -1), 'admin'],
    queryFn: () => service.getProductByIdAdmin(id!),
    enabled: id != null,
  });
}

export function useProductBySlug(manufacturerSlug: string | undefined, partSlug: string | undefined) {
  return useQuery({
    queryKey: productKeys.bySlug(manufacturerSlug ?? '', partSlug ?? ''),
    queryFn: () => service.getProductBySlug(manufacturerSlug!, partSlug!),
    enabled: !!manufacturerSlug && !!partSlug,
  });
}

export function useFeaturedProducts() {
  return useQuery({ queryKey: productKeys.featured, queryFn: service.getFeaturedProducts });
}

export function useBestSellingProducts() {
  return useQuery({ queryKey: productKeys.bestSellers, queryFn: service.getBestSellingProducts });
}

export function useNewProducts() {
  return useQuery({ queryKey: productKeys.newArrivals, queryFn: service.getNewProducts });
}

export function useRelatedProducts(product: Product | undefined) {
  return useQuery({
    queryKey: productKeys.related(product?.id ?? -1),
    queryFn: () => service.getRelatedProducts(product!),
    enabled: !!product,
  });
}

export function useManufacturers(options: { includeDisabled?: boolean } = {}) {
  return useQuery({
    queryKey: [...productKeys.manufacturers, options.includeDisabled ?? false],
    queryFn: () => service.getManufacturers(options),
  });
}

export function useManufacturer(slug: string | undefined) {
  return useQuery({
    queryKey: productKeys.manufacturer(slug ?? ''),
    queryFn: () => service.getManufacturerBySlug(slug!),
    enabled: !!slug,
  });
}

export function useCategories(options: { includeDisabled?: boolean } = {}) {
  return useQuery({
    queryKey: [...productKeys.categories, options.includeDisabled ?? false],
    queryFn: () => service.getCategories(options),
  });
}

export function useCategory(slug: string | undefined) {
  return useQuery({
    queryKey: productKeys.category(slug ?? ''),
    queryFn: () => service.getCategoryBySlug(slug!),
    enabled: !!slug,
  });
}

export function useProductsByIds(ids: number[]) {
  const key = [...ids].sort((a, b) => a - b).join(',');
  return useQuery({
    queryKey: ['products', 'by-ids', key],
    queryFn: async () => {
      const results = await Promise.all(ids.map((id) => service.getProductById(id)));
      return results.filter((p): p is NonNullable<typeof p> => p != null);
    },
  });
}

export function useProductTypes() {
  return useQuery({ queryKey: productKeys.productTypes, queryFn: service.getProductTypes });
}

function useInvalidateProducts() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: productKeys.all });
}

export function useUpsertProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: service.repository.upsertProduct,
    onSuccess: invalidate,
  });
}

export function useSetProductPublished() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, isPublished }: { id: number; isPublished: boolean }) =>
      service.repository.setProductPublished(id, isPublished),
    onSuccess: invalidate,
  });
}

export function useDeleteProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: service.repository.deleteProduct,
    onSuccess: invalidate,
  });
}
