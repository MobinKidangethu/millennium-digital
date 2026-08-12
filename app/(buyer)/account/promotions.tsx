import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDBadge, MDButton, MDText, useToast } from '@/design-system';
import { useCartLines } from '@/features/cart';
import { promotionsService } from '@/features/promotions';
import { usePromoStore } from '@/state';
import { ProtoBadge } from '@/components/ProtoBadge';
import type { Promotion } from '@/types';

/**
 * Account → Promotions: browse active demo promo codes and apply one
 * directly to the cart — the same usePromoStore + evaluatePromoCode path
 * used by the Cart and Checkout order-summary promo field, so a code
 * applied here shows up immediately in Cart/Checkout totals.
 */
export default function AccountPromotions() {
  const router = useRouter();
  const toast = useToast();
  const { subtotal } = useCartLines();
  const appliedCode = usePromoStore((s) => s.appliedCode);
  const setAppliedCode = usePromoStore((s) => s.setAppliedCode);

  const promotions = promotionsService.getActivePromotions();

  const handleApply = (promo: Promotion) => {
    const result = promotionsService.evaluatePromoCode(promo.code, subtotal);
    if (!result.ok) {
      toast.show(result.error ?? 'This code can’t be applied right now.', 'warning');
      return;
    }
    setAppliedCode(promo.code);
    toast.show(`${promo.code} applied to your cart.`, 'success');
  };

  return (
    <View>
      <MDText variant="h1" style={{ marginBottom: spacing.xs }}>
        Promotions
      </MDText>
      <MDText variant="body" tone="secondary" style={{ marginBottom: spacing.lg }}>
        Active offers you can apply to your cart. One code can be applied per order.
      </MDText>

      {appliedCode ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            borderWidth: 1,
            borderColor: colors.status.success,
            backgroundColor: colors.status.successSoft,
            borderRadius: radius.lg,
            padding: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          <Ionicons name="pricetag" size={18} color={colors.status.successStrong} />
          <View style={{ flex: 1 }}>
            <MDText variant="bodySm" weight="700" style={{ color: colors.status.successStrong }}>
              {appliedCode} is applied to your cart
            </MDText>
            <MDText variant="caption" tone="secondary">
              It will carry through checkout automatically.
            </MDText>
          </View>
          <MDText
            variant="caption"
            weight="600"
            style={{ color: colors.brand.primary }}
            onPress={() => router.push('/(buyer)/cart')}
          >
            View Cart →
          </MDText>
        </View>
      ) : null}

      <View style={{ gap: spacing.md }}>
        {promotions.map((promo) => (
          <PromotionCard
            key={promo.code}
            promo={promo}
            isApplied={promo.code === appliedCode}
            onApply={() => handleApply(promo)}
            onRemove={() => setAppliedCode(null)}
          />
        ))}
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <ProtoBadge label="Demo promo codes for this prototype — not official Millennium Digital commercial offers" />
      </View>
    </View>
  );
}

function PromotionCard({
  promo,
  isApplied,
  onApply,
  onRemove,
}: {
  promo: Promotion;
  isApplied: boolean;
  onApply: () => void;
  onRemove: () => void;
}) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: isApplied ? colors.brand.primary : colors.border,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.sm,
        backgroundColor: isApplied ? colors.brand.primarySoft : colors.surfaceRaised,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm }}>
        <View style={{ flex: 1, gap: 4 }}>
          <MDBadge label={promo.badge} tone="brand" />
          <MDText variant="bodyMedium" weight="700" style={{ marginTop: 2 }}>
            {promo.title}
          </MDText>
          <MDText variant="bodySm" tone="secondary">
            {promo.description}
          </MDText>
        </View>
        <View
          style={{
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: colors.brand.primary,
            borderRadius: radius.sm,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
          }}
        >
          <MDText variant="bodySm" weight="700" style={{ color: colors.brand.primary, letterSpacing: 0.5 }}>
            {promo.code}
          </MDText>
        </View>
      </View>

      <MDButton
        label={isApplied ? 'Applied — Remove from Cart' : 'Apply to Cart'}
        variant={isApplied ? 'outline' : 'primary'}
        size="sm"
        style={{ alignSelf: 'flex-start' }}
        onPress={isApplied ? onRemove : onApply}
      />
    </View>
  );
}
