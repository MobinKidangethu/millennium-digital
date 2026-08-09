import { Ionicons } from '@expo/vector-icons';
import { Pressable, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from './tokens';
import { noWebOutline } from './webStyles';

interface MDSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
  onFocus?: () => void;
}

export function MDSearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Search part number, manufacturer, or keyword…',
  autoFocus,
  style,
  onFocus,
}: MDSearchBarProps) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          height: 44,
        },
        style,
      ]}
    >
      <Ionicons name="search" size={18} color={colors.text.tertiary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        autoFocus={autoFocus}
        onFocus={onFocus}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        style={[
          {
            flex: 1,
            height: '100%',
            fontSize: 14,
            lineHeight: 18,
            paddingVertical: 0,
            color: colors.text.primary,
          },
          noWebOutline,
        ]}
      />
      {value.length > 0 ? (
        <Pressable accessibilityLabel="Clear search" onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={18} color={colors.text.tertiary} />
        </Pressable>
      ) : null}
    </View>
  );
}
