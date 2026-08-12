import { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  radius,
  shadow,
  spacing,
  zIndex,
  MDButton,
  MDIconButton,
  MDText,
} from '@/design-system';
import { useCartFeedbackStore, useCartStore, selectCartCount } from '@/state';
import { useCartLines } from '@/features/cart/hooks';
import { MDProductImage } from './MDProductImage';
import { MDPrice } from './MDPrice';

const AUTO_DISMISS_MS = 5500;

/**
 * Confirmation card shown after "Add to Cart". Distinct from the generic
 * green-check toast pattern: uses the MD design system (brand accent rail,
 * MDButton/MDText/spacing tokens) and surfaces real cart state (live item
 * count + subtotal from the cart store) rather than a static message.
 */
export function AddedToCartPopup() {
  const router = useRouter();
  const product = useCartFeedbackStore((s) => s.popupProduct);
  const quantity = useCartFeedbackStore((s) => s.popupQuantity);
  const bumpToken = useCartFeedbackStore((s) => s.bumpToken);
  const dismiss = useCartFeedbackStore((s) => s.dismissPopup);
  const cartCount = useCartStore(selectCartCount);
  const { subtotal } = useCartLines();

  const anim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!product) return;
    anim.setValue(0);
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 9, tension: 90 }).start();

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bumpToken]);

  if (!product) return null;

  const lineTotal = product.price * quantity;

  return (
    <View
      pointerEvents="box-none"
      style={{
        // Deliberately `absolute` (not web `fixed`) — this app has hit
        // cross-platform reliability issues with `position: fixed` under
        // React Native Web before (see CurrencySwitcher). The popup is
        // mounted as the last sibling of the full-screen buyer layout
        // container, so `absolute` here already spans the whole screen.
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: zIndex.modal,
        paddingTop: spacing.xl,
        paddingHorizontal: spacing.lg,
      }}
    >
      <Animated.View
        style={{
          width: '100%',
          maxWidth: 400,
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }),
            },
          ],
        }}
      >
        <View
          style={[
            shadow.lg,
            {
              backgroundColor: colors.surfaceRaised,
              borderRadius: radius.lg,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={{ height: 3, backgroundColor: colors.brand.primary }} />

          <View style={{ padding: spacing.lg, gap: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: radius.pill,
                  backgroundColor: colors.status.success,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="checkmark" size={14} color={colors.gray[0]} />
              </View>
              <MDText variant="bodyLg" weight="700" style={{ flex: 1 }}>
                Added to Cart
              </MDText>
              <MDIconButton accessibilityLabel="Dismiss" variant="ghost" size={28} onPress={dismiss}>
                <Ionicons name="close" size={16} color={colors.text.tertiary} />
              </MDIconButton>
            </View>

            <Pressable
              onPress={() => {
                dismiss();
                router.push({
                  pathname: '/(buyer)/products/[manufacturer]/[part]',
                  params: { manufacturer: product.manufacturerSlug, part: product.partSlug },
                });
              }}
              style={{ flexDirection: 'row', gap: spacing.md }}
            >
              <MDProductImage
                imagePath={product.image}
                alt={product.title}
                style={{ width: 56, height: 56 }}
              />
              <View style={{ flex: 1, gap: 2 }}>
                <MDText variant="bodyMedium" weight="700" numberOfLines={1} style={{ color: colors.brand.primary }}>
                  {product.manufacturerPartNumber}
                </MDText>
                <MDText variant="caption" tone="secondary" numberOfLines={1}>
                  {product.title}
                </MDText>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                  <MDText variant="caption" tone="tertiary">
                    Qty: {quantity}
                  </MDText>
                  <MDPrice amount={lineTotal} currency={product.currency} size="sm" />
                </View>
              </View>
            </Pressable>

            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: colors.border,
                paddingTop: spacing.sm,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <MDText variant="bodySm" tone="secondary">
                Items in cart: <MDText variant="bodySm" weight="700">{cartCount}</MDText>
              </MDText>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <MDText variant="bodySm" tone="secondary">
                  Subtotal:
                </MDText>
                <MDPrice amount={subtotal} currency={product.currency} size="sm" />
              </View>
            </View>

            <MDButton
              label="View Cart"
              fullWidth
              onPress={() => {
                dismiss();
                router.push('/(buyer)/cart');
              }}
            />
            <MDButton label="Continue Shopping" variant="outline" fullWidth onPress={dismiss} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
