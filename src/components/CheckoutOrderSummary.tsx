import type { ComponentType } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDText } from '@/design-system';
import { useCartLines } from '@/features/cart';
import { promotionsService } from '@/features/promotions';
import { useCheckoutStore, useCurrencyStore, usePromoStore } from '@/state';
import { TAX_RATE } from '@/features/checkout';
import { TRUST_ICONS } from '@/constants/trustIcons';
import { formatDisplayPrice } from '@/utils';
import { MDProductImage } from './MDProductImage';
import { PromoCodeField } from './PromoCodeField';

/**
 * Persistent order-summary panel shown alongside every checkout step
 * (address, shipping, payment, review) — pattern adapted from common
 * B2B-distributor checkout flows: the buyer should never lose sight of
 * what they're paying for while filling in details. Own brand/colors,
 * not a copy of any reference site's visuals.
 */
export function CheckoutOrderSummary({ compact = false }: { compact?: boolean }) {
  const { lines, subtotal } = useCartLines();
  const shippingMethod = useCheckoutStore((s) => s.shippingMethod);
  const displayCurrency = useCurrencyStore((s) => s.currency);
  const appliedCode = usePromoStore((s) => s.appliedCode);
  const currency = lines[0]?.product.currency ?? 'INR';
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const shippingCost = shippingMethod?.cost ?? null;

  // Same evaluatePromoCode call the Cart page and PromoCodeField use, so a
  // code applied on the Cart page carries through checkout with an
  // identical discount — not a separately-computed number.
  const promoEvaluation = appliedCode ? promotionsService.evaluatePromoCode(appliedCode, subtotal) : null;
  const discount = promoEvaluation?.ok ? promoEvaluation.applied!.discountAmount : 0;
  const total = Math.max(0, subtotal + tax + (shippingCost ?? 0) - discount);

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.surfaceRaised,
        padding: spacing.lg,
        gap: spacing.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
        <Ionicons name="receipt-outline" size={16} color={colors.text.secondary} />
        <MDText variant="bodyMedium">Order Summary</MDText>
        <MDText variant="caption" tone="tertiary">
          · {lines.length} item{lines.length === 1 ? '' : 's'}
        </MDText>
      </View>

      {!compact ? (
        <View style={{ gap: spacing.sm }}>
          {lines.map((line) => (
            <View key={line.product.id} style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, flexShrink: 0 }}>
                <MDProductImage imagePath={line.product.image} alt={line.product.title} style={{ width: '100%', height: '100%' }} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <MDText variant="bodySm" weight="600" numberOfLines={1}>
                  {line.product.manufacturerPartNumber}
                </MDText>
                <MDText variant="caption" tone="tertiary">
                  Qty {line.quantity}
                </MDText>
              </View>
              <MDText variant="bodySm" weight="600">
                {formatDisplayPrice(line.lineTotal, line.product.currency, displayCurrency)}
              </MDText>
            </View>
          ))}
        </View>
      ) : null}

      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, gap: 6 }}>
        <SummaryRow label="Subtotal" value={formatDisplayPrice(subtotal, currency, displayCurrency)} />
        {discount > 0 ? (
          <SummaryRow
            label="Promo Discount"
            value={`−${formatDisplayPrice(discount, currency, displayCurrency)}`}
            tone="success"
          />
        ) : null}
        <SummaryRow
          label="Shipping"
          value={shippingCost == null ? 'Calculated at next step' : shippingCost === 0 ? 'Free' : formatDisplayPrice(shippingCost, currency, displayCurrency)}
          muted={shippingCost == null}
        />
        <SummaryRow label="Tax (GST)" value={formatDisplayPrice(tax, currency, displayCurrency)} />
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: 2 }}>
          <SummaryRow label="Total" value={formatDisplayPrice(total, currency, displayCurrency)} bold />
        </View>
      </View>

      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm }}>
        <PromoCodeField subtotal={subtotal} currency={currency} displayCurrency={displayCurrency} />
      </View>

      <View style={{ gap: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm }}>
        <TrustRow icon={TRUST_ICONS.shippingAvailable} label="Secure checkout — SSL encrypted" />
        <TrustRow icon={TRUST_ICONS.volumePricing} label="Volume & contract pricing via RFQ" />
        <TrustRow icon={TRUST_ICONS.technicalSupport} label="Enterprise support for bulk orders" />
      </View>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  bold,
  muted,
  tone,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  tone?: 'success';
}) {
  const successColor = tone === 'success' ? colors.status.successStrong : undefined;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <MDText
        variant={bold ? 'bodyMedium' : 'bodySm'}
        tone={bold ? 'primary' : 'secondary'}
        style={successColor ? { color: successColor } : undefined}
      >
        {label}
      </MDText>
      <MDText
        variant={bold ? 'bodyMedium' : 'bodySm'}
        weight={bold ? '700' : '400'}
        tone={muted ? 'tertiary' : 'primary'}
        style={successColor ? { color: successColor } : undefined}
      >
        {value}
      </MDText>
    </View>
  );
}

function TrustRow({ icon: Icon, label }: { icon: ComponentType<{ width?: number; height?: number }>; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <Icon width={14} height={14} />
      <MDText variant="caption" tone="secondary" style={{ flex: 1 }}>
        {label}
      </MDText>
    </View>
  );
}
