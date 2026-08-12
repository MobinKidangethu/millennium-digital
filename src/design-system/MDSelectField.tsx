import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from './tokens';
import { MDText } from './MDText';

interface MDSelectFieldProps {
  label?: string;
  value: string;
  placeholder?: string;
  onPress: () => void;
  error?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Same visual chrome as MDInput, but opens a picker (MDSelectModal) instead of a keyboard. */
export function MDSelectField({ label, value, placeholder, onPress, error, disabled, style }: MDSelectFieldProps) {
  const borderColor = error ? colors.status.error : colors.border;

  return (
    <View style={style}>
      {label ? (
        <MDText variant="bodySm" weight="600" style={{ marginBottom: spacing.xs }}>
          {label}
        </MDText>
      ) : null}
      <Pressable
        onPress={disabled ? undefined : onPress}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor,
          borderRadius: radius.md,
          backgroundColor: disabled ? colors.gray[100] : colors.surfaceRaised,
          paddingHorizontal: spacing.md,
          minHeight: 46,
        }}
      >
        <MDText variant="bodySm" style={{ color: value ? colors.text.primary : colors.text.tertiary, flex: 1 }} numberOfLines={1}>
          {value || placeholder}
        </MDText>
        <Ionicons name="chevron-down" size={16} color={colors.text.tertiary} />
      </Pressable>
      {error ? (
        <MDText variant="caption" style={{ color: colors.status.error, marginTop: spacing.xs }}>
          {error}
        </MDText>
      ) : null}
    </View>
  );
}
