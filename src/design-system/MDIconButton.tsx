import { useState, type ReactNode } from 'react';
import { Pressable, type GestureResponderEvent, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius } from './tokens';
import { webTransition } from './webStyles';

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
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={(e: GestureResponderEvent) => {
        // Icon buttons are frequently nested inside a pressable card
        // (e.g. wishlist/compare on a product card) — stop the press
        // from also triggering the card's own onPress.
        e.stopPropagation?.();
        onPress?.();
      }}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      disabled={disabled}
      style={({ pressed }) => [
        webTransition,
        {
          width: size,
          height: size,
          borderRadius: radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            variant === 'filled'
              ? pressed
                ? colors.gray[300]
                : hovered
                  ? colors.gray[200]
                  : colors.gray[100]
              : pressed
                ? colors.brand.primarySoft
                : hovered
                  ? colors.gray[100]
                  : 'transparent',
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: variant === 'outline' && (hovered || pressed) ? colors.brand.primary : colors.border,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed && !disabled ? 0.9 : hovered && !disabled ? 1.06 : 1 }],
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}
