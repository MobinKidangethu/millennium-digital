import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, useHoverPress, webTransition, MDText } from '@/design-system';
import { useCurrencyStore, type DisplayCurrency } from '@/state';

const OPTIONS: { value: DisplayCurrency; label: string; symbol: string }[] = [
  { value: 'INR', label: 'INR — Indian Rupee', symbol: '₹' },
  { value: 'USD', label: 'USD — US Dollar', symbol: '$' },
];

function CurrencyOption({
  option,
  active,
  onPress,
}: {
  option: (typeof OPTIONS)[number];
  active: boolean;
  onPress: () => void;
}) {
  const { hovered, hoverHandlers } = useHoverPress();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="menuitem"
      accessibilityLabel={option.label}
      {...hoverHandlers}
      style={[
        webTransition,
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          backgroundColor: hovered ? colors.gray[100] : 'transparent',
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <MDText variant="bodySm" weight="700" style={{ color: active ? colors.brand.primary : colors.text.primary, width: 16 }}>
          {option.symbol}
        </MDText>
        <MDText variant="bodySm" weight={active ? '700' : '500'} style={{ color: active ? colors.brand.primary : colors.text.primary }}>
          {option.label}
        </MDText>
      </View>
      {active ? <Ionicons name="checkmark" size={14} color={colors.brand.primary} /> : null}
    </Pressable>
  );
}

/**
 * Storefront-wide display currency switcher, lives in the header. Changing
 * it updates every price shown across the app (via MDPrice / formatDisplayPrice)
 * — see src/state/currencyStore.ts and src/utils/currency.ts. Conversion uses
 * a static demo rate; this is a display convenience, not a live FX feed.
 */
export function CurrencySwitcher({ compact }: { compact?: boolean }) {
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const [open, setOpen] = useState(false);
  const { hovered, hoverHandlers } = useHoverPress();

  const activeOption = OPTIONS.find((o) => o.value === currency) ?? OPTIONS[0];

  return (
    <View style={{ position: 'relative' }}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={`Display currency: ${activeOption.label}. Change currency`}
        {...hoverHandlers}
        style={[
          webTransition,
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: spacing.sm,
            height: 36,
            borderRadius: radius.pill,
            backgroundColor: hovered || open ? colors.gray[100] : 'transparent',
          },
        ]}
      >
        <MDText variant="bodySm" weight="700" style={{ color: colors.text.primary }}>
          {activeOption.symbol} {currency}
        </MDText>
        {!compact ? (
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={13} color={colors.text.secondary} />
        ) : null}
      </Pressable>

      {open ? (
        <>
          <Pressable
            onPress={() => setOpen(false)}
            accessibilityLabel="Close currency menu"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 } as any}
          />
          <View
            style={[
              {
                position: 'absolute',
                top: 40,
                right: 0,
                minWidth: 190,
                backgroundColor: colors.surfaceRaised,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                paddingVertical: spacing.xs,
                overflow: 'hidden',
                zIndex: 50,
              },
              shadow.lg,
            ]}
          >
            {OPTIONS.map((option) => (
              <CurrencyOption
                key={option.value}
                option={option}
                active={option.value === currency}
                onPress={() => {
                  setCurrency(option.value);
                  setOpen(false);
                }}
              />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}
