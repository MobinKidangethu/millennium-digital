import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
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
import { ProductTable } from './ProductTable';

type ViewMode = 'grid' | 'table' | 'paginated';
const PAGE_SIZE = 24;

const VIEW_MODES: { key: ViewMode; icon: ComponentProps<typeof Ionicons>['name']; label: string }[] = [
  { key: 'grid', icon: 'grid-outline', label: 'Grid view — scroll to load more' },
  { key: 'table', icon: 'list-outline', label: 'Table view' },
  { key: 'paginated', icon: 'albums-outline', label: 'Paginated view' },
];

function ViewModeToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        overflow: 'hidden',
      }}
    >
      {VIEW_MODES.map((mode, i) => {
        const active = value === mode.key;
        return (
          <Pressable
            key={mode.key}
            onPress={() => onChange(mode.key)}
            accessibilityLabel={mode.label}
            accessibilityState={{ selected: active }}
            style={{
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.sm - 1,
              backgroundColor: active ? colors.brand.primary : 'transparent',
              borderLeftWidth: i === 0 ? 0 : 1,
              borderLeftColor: colors.border,
            }}
          >
            <Ionicons name={mode.icon} size={15} color={active ? colors.gray[0] : colors.text.secondary} />
          </Pressable>
        );
      })}
    </View>
  );
}

function PaginationControls({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        marginTop: spacing.xl,
      }}
    >
      <Pressable
        onPress={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        style={{ padding: spacing.sm, opacity: page === 1 ? 0.35 : 1 }}
        accessibilityLabel="Previous page"
      >
        <Ionicons name="chevron-back" size={16} color={colors.text.secondary} />
      </Pressable>

      {pages.map((p, i) => (
        <View key={p} style={{ flexDirection: 'row', alignItems: 'center' }}>
          {i > 0 && p - pages[i - 1] > 1 ? (
            <MDText variant="caption" tone="tertiary" style={{ marginHorizontal: 2 }}>
              …
            </MDText>
          ) : null}
          <Pressable
            onPress={() => onChange(p)}
            style={{
              width: 30,
              height: 30,
              borderRadius: radius.sm,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: p === page ? colors.brand.primary : 'transparent',
            }}
            accessibilityLabel={`Page ${p}`}
          >
            <MDText variant="caption" weight="700" style={{ color: p === page ? colors.gray[0] : colors.text.secondary }}>
              {p}
            </MDText>
          </Pressable>
        </View>
      ))}

      <Pressable
        onPress={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        style={{ padding: spacing.sm, opacity: page === totalPages ? 0.35 : 1 }}
        accessibilityLabel="Next page"
      >
        <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
      </Pressable>
    </View>
  );
}

interface ProductCatalogViewProps {
  title: string;
  description?: string;
  initialFilters?: ProductFilters;
  hideCategoryFilter?: boolean;
  hideManufacturerFilter?: boolean;
  /**
   * 'flow' (default): sidebar + grid scroll together with the page — the
   * original behavior, used wherever this view sits inside a page-level
   * ScrollView (category pages, search, etc.).
   * 'split': sidebar and product grid each get their own independent
   * scroll region while page chrome above stays put — used on the main
   * Products page, which gives this view a bounded flex:1 area instead of
   * wrapping it in a ScrollView. Only meaningful on desktop; mobile always
   * behaves like 'flow' since there's no persistent sidebar to split from.
   */
  layout?: 'flow' | 'split';
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
  layout = 'flow',
}: ProductCatalogViewProps) {
  const { isDesktopUp, isTabletUp } = useResponsive();
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const { filters, setSort, toggleValue, setRohsOnly, setPriceRange, setMinAvailability, clearAll, activeFilterCount } =
    useCatalogFilters(initialFilters);

  const { data: allProducts } = useProducts({});
  const optionSets = useMemo(() => buildFilterOptionSets(allProducts ?? []), [allProducts]);

  const { data: results, isLoading, isError, refetch } = useProducts(filters);

  useEffect(() => {
    setPage(1);
  }, [filters, viewMode]);

  const numColumns = isDesktopUp ? 3 : isTabletUp ? 3 : 2;
  const totalPages = Math.max(1, Math.ceil((results?.length ?? 0) / PAGE_SIZE));
  const pagedResults = results?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [];

  const filterControls = (
    <ProductFilterControls
      filters={filters}
      optionSets={optionSets}
      onToggle={toggleValue}
      onSetRohsOnly={setRohsOnly}
      onSetPriceRange={setPriceRange}
      onSetMinAvailability={setMinAvailability}
      onClearAll={clearAll}
      hideCategory={hideCategoryFilter}
      hideManufacturer={hideManufacturerFilter}
    />
  );

  const split = layout === 'split' && isDesktopUp;

  return (
    <View style={{ flex: 1, minHeight: 0, flexDirection: isDesktopUp ? 'row' : 'column' }}>
      {isDesktopUp ? (
        split ? (
          <ScrollView
            style={{ width: 228, minWidth: 228, maxWidth: 228, flexShrink: 0, flexGrow: 0 }}
            contentContainerStyle={{ paddingRight: spacing.lg, paddingBottom: spacing.xl, minWidth: 0 }}
            showsVerticalScrollIndicator={false}
          >
            {filterControls}
          </ScrollView>
        ) : (
          <View
            style={{
              width: 228,
              minWidth: 228,
              maxWidth: 228,
              flexShrink: 0,
              flexGrow: 0,
              paddingRight: spacing.lg,
            }}
          >
            {filterControls}
          </View>
        )
      ) : null}

      <View style={{ flex: 1, minHeight: 0, minWidth: 0 }}>
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
            {isDesktopUp ? <ViewModeToggle value={viewMode} onChange={setViewMode} /> : null}
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
          viewMode === 'grid' ? (
            <FlatList
              key={numColumns}
              data={results}
              keyExtractor={(item) => String(item.id)}
              numColumns={numColumns}
              columnWrapperStyle={numColumns > 1 ? { gap: spacing.lg, marginBottom: spacing.lg } : undefined}
              scrollEnabled={split}
              style={split ? { flex: 1 } : undefined}
              contentContainerStyle={split ? { paddingBottom: spacing.xl } : undefined}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={{ flex: 1 / numColumns }}>
                  <MDProductCard product={item} />
                </View>
              )}
            />
          ) : split ? (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: spacing.xl }}
              showsVerticalScrollIndicator={false}
            >
              {viewMode === 'table' ? (
                <ProductTable products={results} />
              ) : (
                <>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
                    {pagedResults.map((item) => (
                      <View key={item.id} style={{ width: `${100 / numColumns - 2}%` }}>
                        <MDProductCard product={item} />
                      </View>
                    ))}
                  </View>
                  <PaginationControls page={page} totalPages={totalPages} onChange={setPage} />
                </>
              )}
            </ScrollView>
          ) : viewMode === 'table' ? (
            <ProductTable products={results} />
          ) : (
            <>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
                {pagedResults.map((item) => (
                  <View key={item.id} style={{ width: `${100 / numColumns - 2}%` }}>
                    <MDProductCard product={item} />
                  </View>
                ))}
              </View>
              <PaginationControls page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )
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
