import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  layout,
  spacing,
  useResponsive,
  MDButton,
  MDEmptyState,
  MDIconButton,
  MDSkeleton,
  MDText,
} from '@/design-system';
import { useProductsByIds } from '@/features/products';
import { useCartFeedbackStore, useCartStore, useWishlistStore } from '@/state';
import { MDProductImage } from '@/components/MDProductImage';
import { MDManufacturerLogo } from '@/components/MDManufacturerLogo';
import { MDPrice } from '@/components/MDPrice';
import { MDStockStatus } from '@/components/MDStockStatus';
import type { Product } from '@/types';

export function WishlistContent() {
  const router = useRouter();
  const { isDesktopUp } = useResponsive();
  const productIds = useWishlistStore((s) => s.productIds);
  const removeFromWishlist = useWishlistStore((s) => s.remove);
  const addToCart = useCartStore((s) => s.addItem);
  const notifyAdded = useCartFeedbackStore((s) => s.notifyAdded);
  const { data: products, isLoading } = useProductsByIds(productIds);

  const moveToCart = (product: Product) => {
    addToCart(product.id, 1);
    removeFromWishlist(product.id);
    notifyAdded(product, 1);
  };

  return (
    <>
        <MDText variant="h1" style={{ marginBottom: spacing.xl }}>
          Wishlist
        </MDText>

        {isLoading ? (
          <View style={{ gap: spacing.md }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <MDSkeleton key={i} height={100} radius={16} />
            ))}
          </View>
        ) : !products || products.length === 0 ? (
          <MDEmptyState
            icon={<Ionicons name="heart-outline" size={40} color={colors.text.tertiary} />}
            title="Your wishlist is empty"
            description="Save components you're evaluating so you can find them quickly later."
            actionLabel="Browse Products"
            onAction={() => router.push('/(buyer)/products')}
          />
        ) : (
          <View style={{ gap: spacing.md }}>
            {products.map((product) => (
              <View
                key={product.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 16,
                  padding: spacing.md,
                }}
              >
                <View style={{ width: 72, height: 72 }}>
                  <MDProductImage imagePath={product.image} alt={product.title} style={{ width: '100%', height: '100%' }} />
                </View>

                <View style={{ flex: 1, gap: 4 }}>
                  <MDManufacturerLogo manufacturer={product.manufacturer} width={70} height={16} />
                  <MDText
                    variant="bodyMedium"
                    onPress={() =>
                      router.push({
                        pathname: '/(buyer)/products/[manufacturer]/[part]',
                        params: { manufacturer: product.manufacturerSlug, part: product.partSlug },
                      })
                    }
                  >
                    {product.manufacturerPartNumber}
                  </MDText>
                  <MDStockStatus stockStatus={product.stockStatus} />
                </View>

                {isDesktopUp ? <MDPrice amount={product.price} currency={product.currency} size="sm" /> : null}

                <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
                  {isDesktopUp ? (
                    <MDButton
                      label="Move to Cart"
                      size="sm"
                      onPress={() => moveToCart(product)}
                    />
                  ) : (
                    <MDIconButton
                      accessibilityLabel="Move to cart"
                      variant="outline"
                      onPress={() => moveToCart(product)}
                    >
                      <Ionicons name="cart-outline" size={18} color={colors.text.primary} />
                    </MDIconButton>
                  )}
                  <MDIconButton
                    accessibilityLabel="Remove from wishlist"
                    onPress={() => removeFromWishlist(product.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.status.error} />
                  </MDIconButton>
                </View>
              </View>
            ))}
          </View>
        )}
    </>
  );
}

export default function Wishlist() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <WishlistContent />
      </View>
    </ScrollView>
  );
}
