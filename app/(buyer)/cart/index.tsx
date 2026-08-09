import { useState, type ComponentType } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  layout,
  radius,
  spacing,
  useResponsive,
  useToast,
  MDBadge,
  MDButton,
  MDEmptyState,
  MDSkeleton,
  MDText,
} from '@/design-system';
import { useCartLines } from '@/features/cart';
import { rfqService } from '@/features/rfq';
import { useBomWorkflowStore, useCartStore, useWishlistStore } from '@/state';
import { formatPrice } from '@/utils';
import { MDProductImage } from '@/components/MDProductImage';
import { MDManufacturerLogo } from '@/components/MDManufacturerLogo';
import { MDStockStatus } from '@/components/MDStockStatus';
import { MDRohsBadge } from '@/components/MDRohsBadge';
import { MDQuantitySelector } from '@/components/MDQuantitySelector';
import { CheckoutStepper } from '@/components/CheckoutStepper';
import { TRUST_ICONS } from '@/constants/trustIcons';
import { PAYMENT_METHOD_OPTIONS } from '@/features/checkout';

const VOLUME_THRESHOLD = 100;

export default function Cart() {
  const router = useRouter();
  const toast = useToast();
  const { isDesktopUp } = useResponsive();
  const { lines, subtotal, isLoading } = useCartLines();
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clear);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const setRfq = useBomWorkflowStore((s) => s.setRfq);
  const setQuote = useBomWorkflowStore((s) => s.setQuote);
  const [requestingQuote, setRequestingQuote] = useState(false);

  const currency = lines[0]?.product.currency ?? 'INR';
  const estimatedShipping = subtotal > 0 ? 0 : 0;
  const total = subtotal + estimatedShipping;
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const eligibleForVolumePricing = lines.some((l) => l.quantity >= VOLUME_THRESHOLD);

  const handleClearCart = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (!window.confirm('Remove all items from your cart?')) return;
    }
    clearCart();
    toast.show('Cart cleared.', 'neutral');
  };

  const handleRequestQuote = async () => {
    if (lines.length === 0) return;
    setRequestingQuote(true);
    try {
      const rfq = await rfqService.createRfq(
        lines.map((l) => ({ product: l.product, quantity: l.quantity })),
        'cart',
      );
      setRfq(rfq);
      setQuote(null);
      router.push({ pathname: '/(buyer)/rfq/[id]', params: { id: rfq.id } });
    } finally {
      setRequestingQuote(false);
    }
  };

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
        <CheckoutStepper current="cart" />

        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, marginBottom: spacing.xl }}>
          <MDText variant="h1">Cart</MDText>
          <MDText variant="bodySm" tone="tertiary">
            {itemCount} item{itemCount === 1 ? '' : 's'}
          </MDText>
        </View>

        <View style={{ flexDirection: isDesktopUp ? 'row' : 'column', gap: spacing['2xl'] }}>
          <View style={{ flex: 2 }}>
            {isDesktopUp ? (
              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: spacing.md,
                  paddingBottom: spacing.sm,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  marginBottom: spacing.sm,
                }}
              >
                <MDText variant="overline" tone="tertiary" style={{ flex: 1 }}>
                  Product
                </MDText>
                <MDText variant="overline" tone="tertiary" style={{ width: 110, textAlign: 'right' }}>
                  Unit Price
                </MDText>
                <MDText variant="overline" tone="tertiary" style={{ width: 140, textAlign: 'center' }}>
                  Qty
                </MDText>
                <MDText variant="overline" tone="tertiary" style={{ width: 110, textAlign: 'right' }}>
                  Extended
                </MDText>
                <View style={{ width: 28 }} />
              </View>
            ) : null}

            <View style={{ gap: spacing.md }}>
              {lines.map((line) => (
                <View
                  key={line.product.id}
                  style={{
                    flexDirection: isDesktopUp ? 'row' : 'column',
                    alignItems: isDesktopUp ? 'center' : 'stretch',
                    gap: spacing.md,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.lg,
                    padding: spacing.md,
                  }}
                >
                  <View style={{ flex: 1, flexDirection: 'row', gap: spacing.md }}>
                    <View style={{ width: 72, height: 72, flexShrink: 0 }}>
                      <MDProductImage
                        imagePath={line.product.image}
                        alt={line.product.title}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </View>

                    <View style={{ flex: 1, gap: 4 }}>
                      <MDManufacturerLogo manufacturer={line.product.manufacturer} width={68} height={16} />
                      <MDText
                        variant="bodyMedium"
                        weight="600"
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
                      {line.product.productType ? (
                        <MDText variant="caption" tone="tertiary">
                          {line.product.productType}
                        </MDText>
                      ) : null}

                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: 2 }}>
                        {line.product.package ? <MDBadge label={line.product.package} /> : null}
                        {line.product.mountingStyle ? <MDBadge label={line.product.mountingStyle} /> : null}
                        {line.product.rohs ? <MDRohsBadge /> : null}
                      </View>

                      <MDStockStatus stockStatus={line.product.stockStatus} availability={line.product.availability} />

                      {!isDesktopUp ? (
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
                      ) : null}

                      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs }}>
                        <Pressable
                          onPress={() => {
                            toggleWishlist(line.product.id);
                            removeItem(line.product.id);
                          }}
                          accessibilityLabel="Save for later"
                          hitSlop={8}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: radius.sm,
                            borderWidth: 1,
                            borderColor: colors.border,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Ionicons name="bookmark-outline" size={14} color={colors.text.secondary} />
                        </Pressable>
                        <Pressable
                          onPress={() => removeItem(line.product.id)}
                          accessibilityLabel="Remove from cart"
                          hitSlop={8}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: radius.sm,
                            borderWidth: 1,
                            borderColor: colors.border,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Ionicons name="trash-outline" size={14} color={colors.status.error} />
                        </Pressable>
                      </View>
                    </View>
                  </View>

                  {isDesktopUp ? (
                    <>
                      <MDText variant="bodySm" style={{ width: 110, textAlign: 'right' }}>
                        {formatPrice(line.product.price, line.product.currency)}
                      </MDText>
                      <View style={{ width: 140, alignItems: 'center' }}>
                        <MDQuantitySelector
                          value={line.quantity}
                          onChange={(q) => setQuantity(line.product.id, q)}
                          max={line.product.availability || undefined}
                          size="sm"
                        />
                      </View>
                      <MDText variant="bodyMedium" weight="700" style={{ width: 110, textAlign: 'right' }}>
                        {formatPrice(line.lineTotal, line.product.currency)}
                      </MDText>
                      <View style={{ width: 28, alignItems: 'flex-end' }}>
                        <Ionicons
                          name="close"
                          size={18}
                          color={colors.text.tertiary}
                          onPress={() => removeItem(line.product.id)}
                        />
                      </View>
                    </>
                  ) : null}
                </View>
              ))}
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.lg,
                marginTop: spacing.md,
                flexWrap: 'wrap',
              }}
            >
              <MDButton
                label="Continue Shopping"
                variant="ghost"
                iconLeft={<Ionicons name="arrow-back" size={14} color={colors.brand.primary} />}
                onPress={() => router.push('/(buyer)/products')}
                style={{ alignSelf: 'flex-start' }}
              />
              <MDText variant="caption" tone="tertiary" onPress={handleClearCart}>
                Clear Cart
              </MDText>
            </View>
          </View>

          <View style={{ flex: 1, gap: spacing.lg }}>
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

              {eligibleForVolumePricing ? (
                <View
                  style={{
                    flexDirection: 'row',
                    gap: spacing.xs,
                    backgroundColor: colors.brand.primarySoft,
                    borderRadius: radius.md,
                    padding: spacing.sm,
                    marginTop: spacing.xs,
                  }}
                >
                  <Ionicons name="pricetags-outline" size={14} color={colors.brand.primary} style={{ marginTop: 1 }} />
                  <MDText variant="caption" style={{ color: colors.brand.primary, flex: 1 }}>
                    Order quantities may qualify for volume pricing — request a quote to see governed pricing.
                  </MDText>
                </View>
              ) : null}

              <MDButton
                label="Proceed to Checkout"
                size="lg"
                fullWidth
                style={{ marginTop: spacing.md }}
                onPress={() => router.push('/(buyer)/checkout/address')}
              />
              <MDButton
                label="Request a Quote Instead"
                variant="outline"
                fullWidth
                loading={requestingQuote}
                onPress={handleRequestQuote}
              />
            </View>

            <View
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.lg,
                gap: spacing.sm,
              }}
            >
              <TrustRow icon={TRUST_ICONS.shippingAvailable} label="Secure checkout — SSL encrypted" />
              <TrustRow icon={TRUST_ICONS.volumePricing} label="Volume & contract pricing via RFQ" />
              <TrustRow
                icon={TRUST_ICONS.authorizedDistributor}
                label={`Accepted: ${PAYMENT_METHOD_OPTIONS.map((p) => p.label).join(', ')}`}
              />
              <TrustRow icon={TRUST_ICONS.technicalSupport} label="Enterprise support for bulk orders" />
            </View>

            <View
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.lg,
                gap: spacing.xs,
                backgroundColor: colors.surface,
              }}
            >
              <MDText variant="bodyMedium">Need Help?</MDText>
              <MDText variant="bodySm" tone="secondary">
                Our team can assist with bulk orders, quotes, and availability.
              </MDText>
              <MDText
                variant="bodySm"
                weight="600"
                style={{ color: colors.brand.primary, marginTop: 2 }}
                onPress={() => router.push('/(buyer)/help')}
              >
                Contact Support →
              </MDText>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function TrustRow({ icon: Icon, label }: { icon: ComponentType<{ width?: number; height?: number }>; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <Icon width={16} height={16} />
      <MDText variant="caption" tone="secondary" style={{ flex: 1 }}>
        {label}
      </MDText>
    </View>
  );
}
