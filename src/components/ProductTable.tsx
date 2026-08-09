import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDText } from '@/design-system';
import type { Product } from '@/types';
import { MDProductImage } from './MDProductImage';
import { MDPrice } from './MDPrice';
import { MDStockStatus } from './MDStockStatus';
import { MDRohsBadge } from './MDRohsBadge';

interface ProductTableProps {
  products: Product[];
}

const COL = {
  image: 44,
  rohs: 56,
  chevron: 20,
};

function HeaderCell({ label, flex, width }: { label: string; flex?: number; width?: number }) {
  return (
    <MDText
      variant="caption"
      weight="700"
      tone="tertiary"
      numberOfLines={1}
      style={flex != null ? { flex, minWidth: 0 } : { width }}
    >
      {label}
    </MDText>
  );
}

function TableRow({ product }: { product: Product }) {
  const router = useRouter();

  const goToDetail = () =>
    router.push({
      pathname: '/(buyer)/products/[manufacturer]/[part]',
      params: { manufacturer: product.manufacturerSlug, part: product.partSlug },
    });

  return (
    <Pressable
      onPress={goToDetail}
      accessibilityRole="link"
      accessibilityLabel={`${product.manufacturer} ${product.manufacturerPartNumber}`}
      style={({ hovered }: any) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          gap: spacing.sm,
          backgroundColor: hovered ? colors.surface : 'transparent',
        },
      ]}
    >
      <View style={{ width: COL.image, height: COL.image, borderRadius: radius.sm, overflow: 'hidden' }}>
        <MDProductImage imagePath={product.image} alt={product.title} style={{ width: '100%', height: '100%' }} />
      </View>

      <View style={{ flex: 2.4, minWidth: 0 }}>
        <MDText variant="bodySm" weight="600" numberOfLines={1}>
          {product.manufacturerPartNumber}
        </MDText>
        <MDText variant="caption" tone="tertiary" numberOfLines={1}>
          {product.manufacturer}
        </MDText>
      </View>

      <View style={{ flex: 1.7, minWidth: 0 }}>
        <MDText variant="caption" numberOfLines={1}>
          {product.productType}
        </MDText>
        {product.package ? (
          <MDText variant="caption" tone="tertiary" numberOfLines={1}>
            {product.package}
          </MDText>
        ) : null}
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <MDPrice amount={product.price} currency={product.currency} size="sm" />
      </View>

      <View style={{ flex: 1.7, minWidth: 0 }}>
        <MDStockStatus stockStatus={product.stockStatus} availability={product.availability} />
      </View>

      <View style={{ width: COL.rohs }}>{product.rohs ? <MDRohsBadge /> : null}</View>

      <View style={{ width: COL.chevron, alignItems: 'flex-end' }}>
        <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
      </View>
    </Pressable>
  );
}

/**
 * Compact tabular product view — an alternative to the card grid, aimed at
 * engineers scanning many part numbers at once. Reuses the same Product
 * data/fields as the grid; no separate data source.
 */
export function ProductTable({ products }: ProductTableProps) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        overflow: 'hidden',
        backgroundColor: colors.surfaceRaised,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderStrong,
          gap: spacing.sm,
          backgroundColor: colors.surface,
        }}
      >
        <View style={{ width: COL.image }} />
        <HeaderCell label="PART / MANUFACTURER" flex={2.4} />
        <HeaderCell label="TYPE / PACKAGE" flex={1.7} />
        <HeaderCell label="PRICE" flex={1} />
        <HeaderCell label="AVAILABILITY" flex={1.7} />
        <HeaderCell label="ROHS" width={COL.rohs} />
        <View style={{ width: COL.chevron }} />
      </View>

      {products.map((product) => (
        <TableRow key={product.id} product={product} />
      ))}
    </View>
  );
}
