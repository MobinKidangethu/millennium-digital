import { useState, type ReactNode } from 'react';
import {
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from './tokens';
import { MDText } from './MDText';
import { noWebOutline } from './webStyles';

interface MDInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  disabled?: boolean;
  multiline?: boolean;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'next' | 'search' | 'go';
  /** Override the label color — used on dark surfaces like the admin console. */
  labelColor?: string;
}

export function MDInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'sentences',
  disabled,
  multiline,
  leftIcon,
  rightElement,
  style,
  testID,
  onSubmitEditing,
  returnKeyType,
  labelColor,
}: MDInputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.status.error
    : focused
      ? colors.brand.primary
      : colors.border;

  return (
    <View style={style}>
      {label ? (
        <MDText
          variant="bodySm"
          weight="600"
          style={[{ marginBottom: spacing.xs }, labelColor ? { color: labelColor } : null]}
        >
          {label}
        </MDText>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          borderWidth: 1,
          borderColor,
          borderRadius: radius.md,
          backgroundColor: disabled ? colors.gray[100] : colors.surfaceRaised,
          paddingHorizontal: spacing.md,
          paddingVertical: multiline ? spacing.sm : 0,
          minHeight: 46,
          gap: spacing.sm,
        }}
      >
        {leftIcon}
        <TextInput
          testID={testID}
          accessibilityLabel={label ?? placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          multiline={multiline}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          style={[
            {
              flex: 1,
              fontSize: 14,
              color: colors.text.primary,
              paddingVertical: multiline ? 0 : spacing.sm,
              minHeight: multiline ? 80 : undefined,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            noWebOutline,
          ]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightElement}
      </View>
      {error ? (
        <MDText variant="caption" style={{ color: colors.status.error, marginTop: spacing.xs }}>
          {error}
        </MDText>
      ) : helperText ? (
        <MDText variant="caption" tone="tertiary" style={{ marginTop: spacing.xs }}>
          {helperText}
        </MDText>
      ) : null}
    </View>
  );
}
