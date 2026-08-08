import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout, radius, spacing, MDButton, MDEmptyState, MDIconButton, MDSkeleton, MDText } from '@/design-system';
import { useProductsByIds } from '@/features/products';
import { useCompareStore } from '@/state';
import { MDProductImage } from '@/components/MDProductImage';
import { MDManufacturerLogo } from '@/components/MDManufacturerLogo';
import { MDPrice } from '@/components/MDPrice';
import { MDStockStatus } from '@/components/MDStockStatus';
import type { Product } from '@/types';

const COMPARE_ROWS: { label: string; get: (p: Product) => string }[] = [
  { label: 'Manufacturer', get: (p) => p.manufacturer },
  { label: 'Part Number', get: (p) => p.manufacturerPartNumber },
  { label: 'Product Type', get: (p) => p.productType },
  { label: 'Technology', get: (p) => p.technology || '—' },
  { label: 'Package', get: (p) => p.package || '—' },
  { label: 'Mounting Style', get: (p) => p.mountingStyle || '—' },
  { label: 'Availability', get: (p) => `${p.stockStatus} · ${p.availability.toLocaleString()}` },
  { label: 'RoHS', get: (p) => (p.rohs ? 'Compliant' : 'Not Compliant') },
  { label: 'Lifecycle', get: (p) => p.lifecycle },
];

const COLUMN_WIDTH = 220;

export default function Compare() {
  const router = useRouter();
  const productIds = useCompareStore((s) => s.productIds);
  const removeFromCompare = useCompareStore((s) => s.remove);
  const clearCompare = useCompareStore((s) => s.clear);
  const { data: products, isLoading } = useProductsByIds(productIds);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.xl,
          }}
        >
          <MDText variant="h1">Compare Products</MDText>
          {products && products.length > 0 ? (
            <MDButton label="Clear All" variant="ghost" size="sm" onPress={clearCompare} />
          ) : null}
        </View>

        {isLoading ? (
          <MDSkeleton height={300} />
        ) : !products || products.length === 0 ? (
          <MDEmptyState
            icon={<Ionicons name="git-compare-outline" size={40} color={colors.text.tertiary} />}
            title="Nothing to compare yet"
            description="Add 2 to 4 products from the catalog to compare their specifications side by side."
            actionLabel="Browse Products"
            onAction={() => router.push('/(buyer)/products')}
          />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ width: 160 }} />
                {products.map((product) => (
                  <View
                    key={product.id}
                    style={{
                      width: COLUMN_WIDTH,
                      padding: spacing.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: radius.lg,
                      marginLeft: spacing.md,
                      alignItems: 'center',
                    }}
                  >
                    <MDIconButton
                      accessibilityLabel="Remove from comparison"
                      size={28}
                      onPress={() => removeFromCompare(product.id)}
                      style={{ alignSelf: 'flex-end' }}
                    >
                      <Ionicons name="close" size={14} color={colors.text.secondary} />
                    </MDIconButton>
                    <View style={{ width: 90, height: 90, marginBottom: spacing.sm }}>
                      <MDProductImage imagePath={product.image} alt={product.title} style={{ width: '100%', height: '100%' }} />
                    </View>
                    <MDManufacturerLogo manufacturer={product.manufacturer} width={70} height={16} />
                    <MDText
                      variant="bodySm"
                      weight="600"
                      align="center"
                      style={{ marginTop: spacing.xs }}
                      onPress={() =>
                        router.push({
                          pathname: '/(buyer)/products/[manufacturer]/[part]',
                          params: { manufacturer: product.manufacturerSlug, part: product.partSlug },
                        })
                      }
                    >
                      {product.manufacturerPartNumber}
                    </MDText>
                    <MDPrice amount={product.price} currency={product.currency} size="sm" />
                    <View style={{ marginTop: spacing.sm }}>
                      <MDStockStatus stockStatus={product.stockStatus} />
                    </View>
                  </View>
                ))}
              </View>

              {COMPARE_ROWS.map((row, rowIndex) => {
                const values = products.map((p) => row.get(p));
                const allSame = values.every((v) => v === values[0]);
                return (
                  <View key={row.label} style={{ flexDirection: 'row' }}>
                    <View
                      style={{
                        width: 160,
                        justifyContent: 'center',
                        paddingVertical: spacing.md,
                        backgroundColor: rowIndex % 2 === 0 ? colors.surface : colors.surfaceRaised,
                      }}
                    >
                      <MDText variant="bodySm" tone="secondary">
                        {row.label}
                      </MDText>
                    </View>
                    {products.map((product, i) => (
                      <View
                        key={product.id}
                        style={{
                          width: COLUMN_WIDTH,
                          marginLeft: spacing.md,
                          justifyContent: 'center',
                          paddingVertical: spacing.md,
                          paddingHorizontal: spacing.sm,
                          backgroundColor: rowIndex % 2 === 0 ? colors.surface : colors.surfaceRaised,
                          borderRadius: 8,
                        }}
                      >
                        <MDText
                          variant="bodySm"
                          weight={allSame ? '400' : '700'}
                          style={{ color: allSame ? colors.text.primary : colors.brand.primary }}
                        >
                          {values[i]}
                        </MDText>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
}
