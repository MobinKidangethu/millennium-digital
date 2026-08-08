import { View } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { colors, radius } from '@/design-system';

interface MDImagePlaceholderProps {
  size?: number;
}

/**
 * Neutral fallback used whenever a product image can't be resolved —
 * a generic component-chip glyph, not a stock photo or invented image.
 */
export function MDImagePlaceholder({ size = 48 }: MDImagePlaceholderProps) {
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.gray[50],
        borderRadius: radius.md,
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <Rect x="12" y="12" width="24" height="24" rx="3" stroke={colors.gray[300]} strokeWidth={2} />
        <Line x1="4" y1="16" x2="12" y2="16" stroke={colors.gray[300]} strokeWidth={2} />
        <Line x1="4" y1="24" x2="12" y2="24" stroke={colors.gray[300]} strokeWidth={2} />
        <Line x1="4" y1="32" x2="12" y2="32" stroke={colors.gray[300]} strokeWidth={2} />
        <Line x1="36" y1="16" x2="44" y2="16" stroke={colors.gray[300]} strokeWidth={2} />
        <Line x1="36" y1="24" x2="44" y2="24" stroke={colors.gray[300]} strokeWidth={2} />
        <Line x1="36" y1="32" x2="44" y2="32" stroke={colors.gray[300]} strokeWidth={2} />
      </Svg>
    </View>
  );
}
