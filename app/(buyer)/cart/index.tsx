import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  layout,
  radius,
  spacing,
  useResponsive,
  MDButton,
  MDEmptyState,
  MDIconButton,
  MDSkeleton,
  MDText,
} from '@/design-system';
import { useCartLines } from '@/features/cart';
import { useCartStore, useWishlistStore } from '@/state';
import { formatPrice } from '@/utils';
import { MDProductImage } from '@/components/MDProductImage';
import { MDManufacturerLogo } from '@/components/MDManufacturerLogo';
import { MDStockStatus } from '@/components/MDStockStatus';
import { MDQuantitySelector } from '@/components/MDQuantitySelector';

export default function Cart() {
  const router = useRouter();
  const { isDesktopUp } = useResponsive();
  const { lines, subtotal, isLoading } = useCartLines();
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const currency = lines[0]?.product.currency ?? 'INR';
  const estimatedShipping = subtotal > 0 ? 0 : 0;
  const total = subtotal + estimatedShipping;

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.xl }}>
        <MDSkeleton height={300} />
      </View>
    );
  }

  if (lines.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <MDEmptyState
          icon={<Ionicons name="cart-outline" size={40} color={colors.text.tertiary} />}
          title="Your cart is empty"
          description="Browse the catalog to find the components you need."
          actionLabel="Browse Products"
          onAction={() => router.push('/(buyer)/products')}
        />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <MDText variant="h1" style={{ marginBottom: spacing.xl }}>
          Cart
        </MDText>

        <View style={{ flexDirection: isDesktopUp ? 'row' : 'column', gap: spacing['2xl'] }}>
          <View style={{ flex: 2, gap: spacing.md }}>
            {lines.map((line) => (
              <View
                key={line.product.id}
                style={{
                  flexDirection: 'row',
                  gap: spacing.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.md,
                }}
              >
                <View style={{ width: 84, height: 84 }}>
                  <MDProductImage
                    imagePath={line.product.image}
                    alt={line.product.title}
                    style={{ width: '100%', height: '100%' }}
                  />
                </View>

                <View style={{ flex: 1, gap: 4 }}>
                  <MDManufacturerLogo manufacturer={line.product.manufacturer} width={70} height={16} />
                  <MDText
                    variant="bodyMedium"
                    onPress={() =>
                      router.push({
                        pathname: '/(buyer)/products/[manufacturer]/[part]',
                        params: {
                          manufacturer: line.product.manufacturerSlug,
                          part: line.product.partSlug,
                        },
                      })
                    }
                  >
                    {line.product.manufacturerPartNumber}
                  </MDText>
                  <MDStockStatus stockStatus={line.product.stockStatus} />

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: spacing.sm,
                    }}
                  >
                    <MDQuantitySelector
                      value={line.quantity}
                      onChange={(q) => setQuantity(line.product.id, q)}
                      max={line.product.availability || undefined}
                      size="sm"
                    />
                    <MDText variant="bodyMedium" weight="700">
                      {formatPrice(line.lineTotal, line.product.currency)}
                    </MDText>
                  </View>

                  <View style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xs }}>
                    <MDText
                      variant="caption"
                      tone="tertiary"
                      onPress={() => {
                        toggleWishlist(line.product.id);
                        removeItem(line.product.id);
                      }}
                    >
                      Save for Later
                    </MDText>
                    <MDText variant="caption" style={{ color: colors.status.error }} onPress={() => removeItem(line.product.id)}>
                      Remove
                    </MDText>
                  </View>
                </View>
              </View>
            ))}

            <MDButton
              label="Continue Shopping"
              variant="ghost"
              onPress={() => router.push('/(buyer)/products')}
              style={{ alignSelf: 'flex-start', marginTop: spacing.sm }}
            />
          </View>

          <View style={{ flex: 1 }}>
            <View
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.lg,
                gap: spacing.sm,
              }}
            >
              <MDText variant="h4" style={{ marginBottom: spacing.xs }}>
                Order Summary
              </MDText>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <MDText variant="bodySm" tone="secondary">
                  Subtotal
                </MDText>
                <MDText variant="bodySm">{formatPrice(subtotal, currency)}</MDText>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <MDText variant="bodySm" tone="secondary">
                  Estimated Shipping
                </MDText>
                <MDText variant="bodySm">Calculated at checkout</MDText>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <MDText variant="bodySm" tone="secondary">
                  Tax
                </MDText>
                <MDText variant="bodySm">Calculated at checkout</MDText>
              </View>

              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  marginTop: spacing.sm,
                  paddingTop: spacing.sm,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <MDText variant="bodyMedium">Total</MDText>
                <MDText variant="bodyMedium" weight="700">
                  {formatPrice(total, currency)}
                </MDText>
              </View>

              <MDButton
                label="Proceed to Checkout"
                size="lg"
                fullWidth
                style={{ marginTop: spacing.md }}
                onPress={() => router.push('/(buyer)/checkout/address')}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
