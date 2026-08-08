import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDBadge, MDButton, MDEmptyState, MDText } from '@/design-system';
import { useProductAdmin } from '@/features/products';
import { MDProductImage } from '@/components/MDProductImage';
import { MDManufacturerLogo } from '@/components/MDManufacturerLogo';
import { MDPrice } from '@/components/MDPrice';
import { MDStockStatus } from '@/components/MDStockStatus';
import { MDSpecTable } from '@/components/MDSpecTable';

export default function ProductPreview() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading } = useProductAdmin(Number(id));

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <MDEmptyState title="Product not found" actionLabel="Back to Products" onAction={() => router.push('/(admin)/products')} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl, maxWidth: 900 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
          <MDText variant="h1">Product Preview</MDText>
          <MDButton
            label="Edit Product"
            variant="outline"
            onPress={() => router.push({ pathname: '/(admin)/products/[id]/edit', params: { id: String(product.id) } })}
          />
        </View>

        {!product.isPublished ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              backgroundColor: colors.status.warningSoft,
              borderRadius: radius.md,
              padding: spacing.md,
              marginBottom: spacing.xl,
            }}
          >
            <Ionicons name="eye-off-outline" size={18} color={colors.status.warningStrong} />
            <MDText variant="bodySm" style={{ color: colors.status.warningStrong }}>
              This product is unpublished and not visible to buyers.
            </MDText>
          </View>
        ) : null}

        <View style={{ backgroundColor: colors.surfaceRaised, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xl }}>
          <View style={{ flexDirection: 'row', gap: spacing['2xl'], marginBottom: spacing.xl }}>
            <View style={{ width: 240, aspectRatio: 1 }}>
              <MDProductImage imagePath={product.image} alt={product.title} style={{ width: '100%', height: '100%' }} />
            </View>
            <View style={{ flex: 1, gap: spacing.sm }}>
              <MDManufacturerLogo manufacturer={product.manufacturer} width={120} height={28} />
              <MDText variant="h2">{product.manufacturerPartNumber}</MDText>
              <MDText variant="body" tone="secondary">
                {product.title}
              </MDText>
              <MDPrice amount={product.price} currency={product.currency} size="lg" />
              <MDStockStatus stockStatus={product.stockStatus} availability={product.availability} size="md" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs }}>
                {product.tags.map((tag) => (
                  <MDBadge key={tag} label={tag} tone="brand" />
                ))}
                {product.rohs ? <MDBadge label="RoHS" tone="success" /> : null}
              </View>
            </View>
          </View>

          <MDSpecTable
            title="Product Information"
            rows={[
              { label: 'Manufacturer', value: product.manufacturer },
              { label: 'Category', value: product.category },
              { label: 'Product Type', value: product.productType },
              { label: 'Package', value: product.package },
              { label: 'Technology', value: product.technology },
            ]}
          />
        </View>
      </View>
    </ScrollView>
  );
}
