import { Pressable, View } from 'react-native';
import { colors, radius } from './tokens';

interface MDSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
}

export function MDSwitch({ value, onValueChange, accessibilityLabel }: MDSwitchProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      onPress={() => onValueChange(!value)}
      style={{
        width: 44,
        height: 26,
        borderRadius: radius.pill,
        backgroundColor: value ? colors.brand.primary : colors.gray[300],
        padding: 3,
        justifyContent: 'center',
        alignItems: value ? 'flex-end' : 'flex-start',
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: radius.pill,
          backgroundColor: colors.gray[0],
        }}
      />
    </Pressable>
  );
}
