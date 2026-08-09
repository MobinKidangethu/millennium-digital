import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, layout, radius, useResponsive, MDButton, MDEmptyState, MDText } from '@/design-system';
import { useCategory } from '@/features/categories';
import { useProducts, buildFilterOptionSets } from '@/features/products';
import { ProductCatalogView } from '@/components/ProductCatalogView';
import { MDStatsCard } from '@/components/MDStatsCard';
import { MDBreadcrumb } from '@/components/MDBreadcrumb';
import { getMasterSubcategoryLabel } from '@/constants/masterCategoryTaxonomy';

export default function CategoryDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { isDesktopUp } = useResponsive();
  const { data: category, isLoading } = useCategory(slug);
  const { data: products } = useProducts(category ? { category: [category.name] } : {}, { enabled: !!category });
  const [selectedType, setSelectedType] = useState<string | null>(null);

  /**
   * Groups the real productType values present on this category's products
   * by their official industry subcategory name (see
   * masterCategoryTaxonomy.ts, referenced from Mouser's public category
   * pages) where a confident mapping exists, otherwise falls back to the
   * raw productType label. Nothing here is invented — every group is
   * backed by real products already in products.json.
   */
  const typeGroups = useMemo(() => {
    const rawOptions = buildFilterOptionSets(products ?? []).productType;
    const map = new Map<string, { label: string; count: number; rawTypes: string[] }>();
    rawOptions.forEach((opt) => {
      const label = getMasterSubcategoryLabel(opt.value) ?? opt.value;
      const existing = map.get(label);
      if (existing) {
        existing.count += opt.count;
        existing.rawTypes.push(opt.value);
      } else {
        map.set(label, { label, count: opt.count, rawTypes: [opt.value] });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [products]);

  const activeGroup = typeGroups.find((g) => g.label === selectedType);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (!category) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <MDEmptyState title="Category not found" description="This category may have been renamed or removed." />
      </View>
    );
  }

  const manufacturerCount = products ? new Set(products.map((p) => p.manufacturer)).size : 0;
  const rohsCount = products ? products.filter((p) => p.rohs).length : 0;
  const rohsPct = products && products.length ? Math.round((rohsCount / products.length) * 100) : 0;
  const totalAvailability = products ? products.reduce((sum, p) => sum + p.availability, 0) : 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <View style={{ marginBottom: spacing.lg }}>
          <MDBreadcrumb items={[{ label: 'Home', href: '/(buyer)' }, { label: 'Categories', href: '/(buyer)/category' }, { label: category.name }]} />
        </View>
        <View
          style={{
            flexDirection: isDesktopUp ? 'row' : 'column',
            justifyContent: 'space-between',
            alignItems: isDesktopUp ? 'flex-end' : 'flex-start',
            gap: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          <View style={{ flex: 1 }}>
            <MDText variant="overline" tone="tertiary" style={{ marginBottom: spacing.xs }}>
              ENGINEERING COMPONENT DISCOVERY
            </MDText>
            <MDText variant="h1">{category.name}</MDText>
            <MDText variant="body" tone="secondary" style={{ marginTop: spacing.xs, maxWidth: 560 }}>
              Filter by manufacturer, technology, mounting style, package, RoHS and availability to find the
              exact part your design needs.
            </MDText>
          </View>
          <MDButton
            label="Ask AI to Find a Part"
            variant="outline"
            iconLeft={<Ionicons name="sparkles-outline" size={16} color={colors.brand.primary} />}
            onPress={() => router.push({ pathname: '/(buyer)/ai-search', params: { q: `Find a ${category.name.replace(/s$/, '')} component` } })}
          />
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing['2xl'] }}>
          <MDStatsCard label="Parts in this category" value={String(category.productCount)} icon="cube-outline" />
          <MDStatsCard label="Manufacturers represented" value={String(manufacturerCount)} icon="business-outline" />
          <MDStatsCard label="RoHS compliant" value={`${rohsPct}%`} icon="leaf-outline" tone="success" />
          <MDStatsCard label="Units in stock" value={totalAvailability.toLocaleString()} icon="layers-outline" />
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            padding: spacing.md,
            borderRadius: radius.md,
            backgroundColor: colors.surface,
            marginBottom: spacing.xl,
          }}
        >
          <Ionicons name="information-circle-outline" size={16} color={colors.text.tertiary} />
          <MDText variant="caption" tone="tertiary" style={{ flex: 1 }}>
            Filters reflect real catalog attributes only. Parametric fields not present in the current dataset
            (e.g. voltage/current ratings) are a target enhancement — see AI Search for how those requirements
            are handled today.
          </MDText>
        </View>

        {typeGroups.length > 1 ? (
          <View style={{ marginBottom: spacing.xl }}>
            <MDText variant="overline" tone="tertiary" style={{ marginBottom: spacing.sm }}>
              BROWSE BY TYPE
            </MDText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              <TypePill
                label="All Types"
                active={selectedType === null}
                onPress={() => setSelectedType(null)}
              />
              {typeGroups.map((group) => (
                <TypePill
                  key={group.label}
                  label={group.label}
                  count={group.count}
                  active={selectedType === group.label}
                  onPress={() => setSelectedType(group.label)}
                />
              ))}
            </View>
          </View>
        ) : null}

        <ProductCatalogView
          key={selectedType ?? 'all'}
          title="Matching Components"
          description={`${category.productCount} product${category.productCount === 1 ? '' : 's'} in this category.`}
          initialFilters={{ category: [category.name], productType: activeGroup?.rawTypes }}
          hideCategoryFilter
        />
      </View>
    </ScrollView>
  );
}

function TypePill({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count?: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: active ? colors.brand.primary : colors.border,
        backgroundColor: active ? colors.brand.primary : colors.surface,
      }}
    >
      <MDText variant="bodySm" weight="600" style={{ color: active ? colors.gray[0] : colors.text.secondary }}>
        {label}
      </MDText>
      {count != null ? (
        <MDText variant="caption" style={{ color: active ? colors.gray[0] : colors.text.tertiary }}>
          {count}
        </MDText>
      ) : null}
    </Pressable>
  );
}
