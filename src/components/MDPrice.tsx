import { View } from 'react-native';
import { colors, spacing, MDText } from '@/design-system';
import { formatDisplayPrice } from '@/utils';
import { useCurrencyStore } from '@/state';

interface MDPriceProps {
  amount: number;
  currency: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_VARIANT = {
  sm: 'bodyMedium',
  md: 'h4',
  lg: 'h2',
} as const;

export function MDPrice({ amount, currency, size = 'md' }: MDPriceProps) {
  const displayCurrency = useCurrencyStore((s) => s.currency);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs }}>
      <MDText variant={SIZE_VARIANT[size]} weight="700" style={{ color: colors.text.primary }}>
        {formatDisplayPrice(amount, currency, displayCurrency)}
      </MDText>
    </View>
  );
}
