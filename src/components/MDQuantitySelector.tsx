import { TextInput, View } from 'react-native';
import { colors, radius, spacing, MDIconButton } from '@/design-system';
import { Ionicons } from '@expo/vector-icons';

interface MDQuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}

export function MDQuantitySelector({ value, onChange, min = 1, max, size = 'md' }: MDQuantitySelectorProps) {
  const clamp = (n: number) => {
    let v = Math.max(min, n);
    if (max != null) v = Math.min(max, v);
    return v;
  };

  const height = size === 'sm' ? 32 : 40;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        height,
      }}
    >
      <MDIconButton
        accessibilityLabel="Decrease quantity"
        onPress={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        size={height}
      >
        <Ionicons name="remove" size={16} color={colors.text.primary} />
      </MDIconButton>
      <TextInput
        value={String(value)}
        onChangeText={(text) => {
          const n = parseInt(text.replace(/[^0-9]/g, ''), 10);
          onChange(Number.isNaN(n) ? min : clamp(n));
        }}
        keyboardType="numeric"
        style={{
          width: 44,
          textAlign: 'center',
          fontSize: 14,
          color: colors.text.primary,
        }}
      />
      <MDIconButton
        accessibilityLabel="Increase quantity"
        onPress={() => onChange(clamp(value + 1))}
        disabled={max != null && value >= max}
        size={height}
      >
        <Ionicons name="add" size={16} color={colors.text.primary} />
      </MDIconButton>
    </View>
  );
}
