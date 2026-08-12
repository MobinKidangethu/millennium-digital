import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDButton, MDInput, MDText } from '@/design-system';
import { promotionsService } from '@/features/promotions';
import { usePromoStore } from '@/state';
import { formatDisplayPrice } from '@/utils';

/**
 * Promo code entry + applied-code chip, shared by the Cart page and the
 * checkout Order Summary so a code applied in either place is reflected in
 * both (via usePromoStore). Discount math comes from
 * promotionsService.evaluatePromoCode — same function both surfaces call,
 * so a code never produces a different discount in Cart vs. Checkout.
 */
export function PromoCodeField({
  subtotal,
  currency,
  displayCurrency,
  onAppliedChange,
}: {
  subtotal: number;
  currency: string;
  displayCurrency: string;
  /** Called with the resolved discount amount (0 if none/invalid) whenever the applied code or subtotal changes. */
  onAppliedChange?: (discountAmount: number) => void;
}) {
  const appliedCode = usePromoStore((s) => s.appliedCode);
  const setAppliedCode = usePromoStore((s) => s.setAppliedCode);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const evaluation = appliedCode ? promotionsService.evaluatePromoCode(appliedCode, subtotal) : null;
  const resolvedDiscount = evaluation?.ok ? evaluation.applied!.discountAmount : 0;

  // Surface the resolved discount to the parent for total calculations.
  // If a previously-applied code no longer qualifies (e.g. cart dropped
  // below its minimum subtotal), report 0 rather than silently keeping a
  // stale discount. Runs as an effect (not during render) so it doesn't
  // trigger a parent state update while this component is rendering.
  useEffect(() => {
    onAppliedChange?.(resolvedDiscount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedDiscount]);

  const handleApply = () => {
    const result = promotionsService.evaluatePromoCode(input, subtotal);
    if (!result.ok) {
      setError(result.error ?? 'Unable to apply this code.');
      return;
    }
    setAppliedCode(result.applied!.code);
    setInput('');
    setError(null);
  };

  const handleRemove = () => {
    setAppliedCode(null);
    setError(null);
  };

  if (appliedCode && evaluation?.ok) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          borderWidth: 1,
          borderColor: colors.status.success,
          backgroundColor: colors.status.successSoft,
          borderRadius: radius.md,
          padding: spacing.sm,
        }}
      >
        <Ionicons name="pricetag" size={16} color={colors.status.successStrong} />
        <View style={{ flex: 1 }}>
          <MDText variant="caption" weight="700" style={{ color: colors.status.successStrong }}>
            {evaluation.applied!.code} applied
          </MDText>
          <MDText variant="caption" tone="secondary">
            {evaluation.applied!.title} · −{formatDisplayPrice(evaluation.applied!.discountAmount, currency, displayCurrency)}
          </MDText>
        </View>
        <Ionicons name="close-circle" size={18} color={colors.text.tertiary} onPress={handleRemove} />
      </View>
    );
  }

  // A code is applied but no longer qualifies against the current subtotal.
  if (appliedCode && evaluation && !evaluation.ok) {
    return (
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.status.warning,
          backgroundColor: colors.status.warningSoft,
          borderRadius: radius.md,
          padding: spacing.sm,
          gap: 2,
        }}
      >
        <MDText variant="caption" weight="700" style={{ color: colors.status.warningStrong }}>
          {appliedCode} no longer applies
        </MDText>
        <MDText variant="caption" tone="secondary">
          {evaluation.error}
        </MDText>
        <MDText variant="caption" weight="600" style={{ color: colors.brand.primary, marginTop: 2 }} onPress={handleRemove}>
          Remove code
        </MDText>
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.xs }}>
      <MDInput
        value={input}
        onChangeText={(v) => {
          setInput(v.toUpperCase());
          if (error) setError(null);
        }}
        placeholder="Promo code"
        autoCapitalize="characters"
        error={error ?? undefined}
        onSubmitEditing={handleApply}
        returnKeyType="go"
        rightElement={<MDButton label="Apply" size="sm" variant="outline" onPress={handleApply} disabled={!input.trim()} />}
      />
    </View>
  );
}
