import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing } from './tokens';

interface MDCardProps {
  children: ReactNode;
  onPress?: () => void;
  padding?: keyof typeof spacing | 0;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

export function MDCard({
  children,
  onPress,
  padding = 'lg',
  elevation = 'sm',
  bordered = true,
  style,
  testID,
  accessibilityLabel,
}: MDCardProps) {
  const base: StyleProp<ViewStyle> = [
    {
      backgroundColor: colors.surfaceRaised,
      borderRadius: radius.lg,
      borderWidth: bordered ? 1 : 0,
      borderColor: colors.border,
      padding: padding === 0 ? 0 : spacing[padding],
    },
    shadow[elevation],
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [base, pressed ? { opacity: 0.9 } : null]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View testID={testID} style={base}>
      {children}
    </View>
  );
}
