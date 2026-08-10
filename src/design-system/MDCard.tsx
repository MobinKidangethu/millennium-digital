import { useState, type ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing } from './tokens';
import { webTransition } from './webStyles';

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
  const [hovered, setHovered] = useState(false);

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
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={({ pressed }) => [
          base,
          webTransition,
          hovered && !pressed
            ? { borderColor: colors.interaction.hoverBorder, transform: [{ translateY: -2 }] }
            : null,
          hovered ? shadow.hover : null,
          pressed ? { opacity: 0.92, transform: [{ translateY: 0 }, { scale: 0.99 }] } : null,
        ]}
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
