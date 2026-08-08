import { View } from 'react-native';
import { colors, spacing, MDText } from '@/design-system';
import { formatPrice } from '@/utils';

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
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs }}>
      <MDText variant={SIZE_VARIANT[size]} weight="700" style={{ color: colors.text.primary }}>
        {formatPrice(amount, currency)}
      </MDText>
    </View>
  );
}
