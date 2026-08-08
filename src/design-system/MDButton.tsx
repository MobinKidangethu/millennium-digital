import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from './tokens';
import { MDText } from './MDText';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface MDButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

const SIZE_STYLES: Record<Size, { paddingV: number; paddingH: number; fontSize: number }> = {
  sm: { paddingV: 8, paddingH: 14, fontSize: 13 },
  md: { paddingV: 12, paddingH: 20, fontSize: 14 },
  lg: { paddingV: 16, paddingH: 28, fontSize: 16 },
};

export function MDButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  fullWidth,
  iconLeft,
  iconRight,
  style,
  testID,
  accessibilityLabel,
}: MDButtonProps) {
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled || loading;
  const sizeStyle = SIZE_STYLES[size];
  const palette = variantPalette(variant, isDisabled, pressed);

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.base,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: variant === 'outline' ? 1 : 0,
          paddingVertical: sizeStyle.paddingV,
          paddingHorizontal: sizeStyle.paddingH,
          opacity: isDisabled && !loading ? 0.5 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.fg} />
      ) : (
        <>
          {iconLeft}
          <MDText
            weight={typography.bodyMedium.fontWeight}
            style={{ color: palette.fg, fontSize: sizeStyle.fontSize }}
          >
            {label}
          </MDText>
          {iconRight}
        </>
      )}
    </Pressable>
  );
}

function variantPalette(variant: Variant, disabled?: boolean, pressed?: boolean) {
  switch (variant) {
    case 'primary':
      return {
        bg: pressed ? colors.brand.primaryPressed : colors.brand.primary,
        fg: colors.text.onPrimary,
        border: 'transparent',
      };
    case 'secondary':
      return {
        bg: pressed ? colors.gray[300] : colors.gray[100],
        fg: colors.text.primary,
        border: 'transparent',
      };
    case 'outline':
      return {
        bg: pressed ? colors.brand.primarySoft : 'transparent',
        fg: colors.brand.primary,
        border: colors.borderStrong,
      };
    case 'ghost':
      return {
        bg: pressed ? colors.gray[100] : 'transparent',
        fg: colors.text.primary,
        border: 'transparent',
      };
    case 'danger':
      return {
        bg: pressed ? colors.status.errorStrong : colors.status.error,
        fg: colors.text.onPrimary,
        border: 'transparent',
      };
    default:
      return { bg: colors.brand.primary, fg: colors.text.onPrimary, border: 'transparent' };
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
  },
});
