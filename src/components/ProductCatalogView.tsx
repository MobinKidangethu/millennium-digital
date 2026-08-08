import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  radius,
  spacing,
  useResponsive,
  MDBadge,
  MDBottomSheet,
  MDButton,
  MDEmptyState,
  MDErrorState,
  MDSkeleton,
  MDText,
} from '@/design-system';
import { useProducts } from '@/features/products/hooks';
import { buildFilterOptionSets, useCatalogFilters } from '@/features/products/useCatalogFilters';
import type { ProductFilters } from '@/types';
import { MDProductCard } from './MDProductCard';
import { ProductFilterControls } from './ProductFilterControls';
import { ProductSortMenu } from './ProductSortMenu';

interface ProductCatalogViewProps {
  title: string;
  description?: string;
  initialFilters?: ProductFilters;
  hideCategoryFilter?: boolean;
  hideManufacturerFilter?: boolean;
}

function CatalogSkeleton({ columns }: { columns: number }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
      {Array.from({ length: columns * 2 }).map((_, i) => (
        <View key={i} style={{ width: `${100 / columns - 2}%`, gap: spacing.sm }}>
          <MDSkeleton height={148} radius={radius.lg} />
          <MDSkeleton height={14} width="60%" />
          <MDSkeleton height={14} width="90%" />
          <MDSkeleton height={32} />
        </View>
      ))}
    </View>
  );
}

export function ProductCatalogView({
  title,
  description,
  initialFilters,
  hideCategoryFilter,
  hideManufacturerFilter,
}: ProductCatalogViewProps) {
  const { isDesktopUp, isTabletUp } = useResponsive();
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const { filters, setSort, toggleValue, setRohsOnly, setPriceRange, clearAll, activeFilterCount } =
    useCatalogFilters(initialFilters);

  const { data: allProducts } = useProducts({});
  const optionSets = useMemo(() => buildFilterOptionSets(allProducts ?? []), [allProducts]);

  const { data: results, isLoading, isError, refetch } = useProducts(filters);

  const numColumns = isDesktopUp ? 3 : isTabletUp ? 3 : 2;

  const filterControls = (
    <ProductFilterControls
      filters={filters}
      optionSets={optionSets}
      onToggle={toggleValue}
      onSetRohsOnly={setRohsOnly}
      onSetPriceRange={setPriceRange}
      onClearAll={clearAll}
      hideCategory={hideCategoryFilter}
      hideManufacturer={hideManufacturerFilter}
    />
  );

  return (
    <View style={{ flex: 1, flexDirection: isDesktopUp ? 'row' : 'column' }}>
      {isDesktopUp ? (
        <View style={{ width: 260, paddingRight: spacing.xl }}>{filterControls}</View>
      ) : null}

      <View style={{ flex: 1 }}>
        <View style={{ marginBottom: spacing.lg }}>
          <MDText variant="h1">{title}</MDText>
          {description ? (
            <MDText variant="body" tone="secondary" style={{ marginTop: spacing.xs }}>
              {description}
            </MDText>
          ) : null}
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.lg,
            flexWrap: 'wrap',
            gap: spacing.sm,
          }}
        >
          <MDText variant="bodySm" tone="secondary">
            {isLoading ? 'Loading…' : `${results?.length ?? 0} result${results?.length === 1 ? '' : 's'}`}
          </MDText>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            {!isDesktopUp ? (
              <Pressable
                onPress={() => setFilterSheetOpen(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                }}
              >
                <Ionicons name="options-outline" size={16} color={colors.text.secondary} />
                <MDText variant="bodySm">
                  Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
                </MDText>
              </Pressable>
            ) : null}
            <ProductSortMenu value={filters.sort ?? 'relevance'} onChange={setSort} />
          </View>
        </View>

        {activeFilterCount > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
            <MDBadge label={`${activeFilterCount} Filter${activeFilterCount === 1 ? '' : 's'} Applied`} tone="brand" />
            <Pressable onPress={clearAll}>
              <MDText variant="caption" weight="600" style={{ color: colors.brand.primary }}>
                Clear All
              </MDText>
            </Pressable>
          </View>
        ) : null}

        {isLoading ? (
          <CatalogSkeleton columns={numColumns} />
        ) : isError ? (
          <MDErrorState onRetry={() => refetch()} />
        ) : results && results.length > 0 ? (
          <FlatList
            key={numColumns}
            data={results}
            keyExtractor={(item) => String(item.id)}
            numColumns={numColumns}
            columnWrapperStyle={numColumns > 1 ? { gap: spacing.lg, marginBottom: spacing.lg } : undefined}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={{ flex: 1 / numColumns }}>
                <MDProductCard product={item} />
              </View>
            )}
          />
        ) : (
          <MDEmptyState
            icon={<Ionicons name="search-outline" size={40} color={colors.text.tertiary} />}
            title="No products match your filters"
            description="Try removing a few filters or searching with a different term."
            actionLabel={activeFilterCount > 0 ? 'Clear All Filters' : undefined}
            onAction={activeFilterCount > 0 ? clearAll : undefined}
          />
        )}
      </View>

      {!isDesktopUp ? (
        <MDBottomSheet visible={filterSheetOpen} onClose={() => setFilterSheetOpen(false)} title="Filters">
          {filterControls}
          <MDButton
            label={`Show ${results?.length ?? 0} Results`}
            fullWidth
            style={{ marginTop: spacing.lg, marginBottom: spacing.xl }}
            onPress={() => setFilterSheetOpen(false)}
          />
        </MDBottomSheet>
      ) : null}
    </View>
  );
}
