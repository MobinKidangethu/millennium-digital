import type { ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius } from './tokens';

interface MDIconButtonProps {
  children: ReactNode;
  onPress?: () => void;
  size?: number;
  variant?: 'ghost' | 'filled' | 'outline';
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function MDIconButton({
  children,
  onPress,
  size = 38,
  variant = 'ghost',
  accessibilityLabel,
  style,
  disabled,
}: MDIconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            variant === 'filled'
              ? colors.gray[100]
              : pressed
                ? colors.gray[100]
                : 'transparent',
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: colors.border,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}
