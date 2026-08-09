import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, layout, radius, useResponsive, MDBadge, MDButton, MDEmptyState, MDText } from '@/design-system';
import { useManufacturer, useProducts } from '@/features/products';
import { MDManufacturerLogo } from '@/components/MDManufacturerLogo';
import { MDStatsCard } from '@/components/MDStatsCard';
import { MDBreadcrumb } from '@/components/MDBreadcrumb';
import { ProductCatalogView } from '@/components/ProductCatalogView';

export default function ManufacturerDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { isDesktopUp } = useResponsive();
  const { data: manufacturer, isLoading } = useManufacturer(slug);
  const { data: products } = useProducts(manufacturer ? { manufacturer: [manufacturer.name] } : {}, {
    enabled: !!manufacturer,
  });

  const breakdown = useMemo(() => {
    if (!products) return [];
    const counts = new Map<string, number>();
    for (const p of products) counts.set(p.productType, (counts.get(p.productType) ?? 0) + 1);
    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [products]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (!manufacturer) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <MDEmptyState title="Manufacturer not found" description="This manufacturer may have been renamed or removed." />
      </View>
    );
  }

  const categoryCount = products ? new Set(products.map((p) => p.category)).size : 0;
  const rohsCount = products ? products.filter((p) => p.rohs).length : 0;
  const rohsPct = products && products.length ? Math.round((rohsCount / products.length) * 100) : 0;
  const datasheetCount = products ? products.filter((p) => !!p.datasheet).length : 0;
  const totalAvailability = products ? products.reduce((sum, p) => sum + p.availability, 0) : 0;
  const maxBreakdownCount = breakdown[0]?.count ?? 1;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <View style={{ marginBottom: spacing.lg }}>
          <MDBreadcrumb items={[{ label: 'Home', href: '/(buyer)' }, { label: 'Manufacturers', href: '/(buyer)/manufacturers' }, { label: manufacturer.name }]} />
        </View>
        {/* Supplier credibility header */}
        <View
          style={{
            flexDirection: isDesktopUp ? 'row' : 'column',
            justifyContent: 'space-between',
            gap: spacing.lg,
            padding: spacing.xl,
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: spacing.xl,
          }}
        >
          <View style={{ flexDirection: 'row', gap: spacing.lg, alignItems: 'center', flex: 1 }}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: radius.lg,
                backgroundColor: colors.surfaceRaised,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MDManufacturerLogo manufacturer={manufacturer.name} width={64} height={40} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
                <MDText variant="h2">{manufacturer.name}</MDText>
                <MDBadge label="Verified Supplier" tone="success" />
              </View>
              <MDText variant="body" tone="secondary" style={{ marginTop: spacing.xs }}>
                {manufacturer.productCount} product{manufacturer.productCount === 1 ? '' : 's'} available across{' '}
                {categoryCount} categor{categoryCount === 1 ? 'y' : 'ies'} in the Millennium Digital catalog.
              </MDText>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
            <MDButton
              label="Ask AI to Source Parts"
              variant="outline"
              iconLeft={<Ionicons name="sparkles-outline" size={16} color={colors.brand.primary} />}
              onPress={() => router.push({ pathname: '/(buyer)/ai-search', params: { q: `${manufacturer.name} components` } })}
            />
            <MDButton label="Submit Design Request" onPress={() => router.push('/(buyer)/design-request')} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing['2xl'] }}>
          <MDStatsCard label="Products listed" value={String(manufacturer.productCount)} icon="cube-outline" />
          <MDStatsCard label="Categories covered" value={String(categoryCount)} icon="grid-outline" />
          <MDStatsCard label="RoHS compliant" value={`${rohsPct}%`} icon="leaf-outline" tone="success" />
          <MDStatsCard label="Technical datasheets" value={String(datasheetCount)} icon="document-text-outline" />
          <MDStatsCard label="Units in stock" value={totalAvailability.toLocaleString()} icon="layers-outline" />
        </View>

        {breakdown.length > 0 ? (
          <View style={{ marginBottom: spacing['2xl'] }}>
            <MDText variant="h4" style={{ marginBottom: spacing.md }}>
              Product Portfolio
            </MDText>
            <View style={{ gap: spacing.sm }}>
              {breakdown.map((item) => (
                <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <MDText variant="bodySm" style={{ width: 200 }} numberOfLines={1}>
                    {item.label}
                  </MDText>
                  <View style={{ flex: 1, height: 8, backgroundColor: colors.gray[100], borderRadius: radius.pill, overflow: 'hidden' }}>
                    <View
                      style={{
                        width: `${Math.max(6, (item.count / maxBreakdownCount) * 100)}%`,
                        height: '100%',
                        backgroundColor: colors.brand.primary,
                      }}
                    />
                  </View>
                  <MDText variant="caption" tone="tertiary" style={{ width: 32, textAlign: 'right' }}>
                    {item.count}
                  </MDText>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            padding: spacing.md,
            borderRadius: radius.md,
            backgroundColor: colors.brand.primarySoft,
            marginBottom: spacing.xl,
          }}
        >
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.brand.primary} />
          <MDText variant="caption" style={{ color: colors.brand.primary, flex: 1 }}>
            Manufacturer identity and product data shown here come directly from the product catalog. Purchase
            order / contract-pricing readiness for this supplier is part of the target enterprise procurement
            architecture.
          </MDText>
        </View>

        <ProductCatalogView title="Products" initialFilters={{ manufacturer: [manufacturer.name] }} hideManufacturerFilter />
      </View>
    </ScrollView>
  );
}
