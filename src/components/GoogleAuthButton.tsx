import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { radius, shadow, spacing, webTransition, MDText } from '@/design-system';
import { GoogleIcon } from './GoogleIcon';

interface GoogleAuthButtonProps {
  label: string;
  onPress: () => void;
}

/** Standard "Continue with Google" button styling, matching Google's own button spec. */
export function GoogleAuthButton({ label, onPress }: GoogleAuthButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.base,
        webTransition,
        {
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        hovered || pressed ? shadow.sm : null,
      ]}
    >
      <GoogleIcon size={18} />
      <MDText weight="600" style={{ color: '#3C4043', fontSize: 14 }}>
        {label}
      </MDText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#DADCE0',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    width: '100%',
  },
});
