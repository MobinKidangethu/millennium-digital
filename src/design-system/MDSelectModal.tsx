import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from './tokens';
import { MDText } from './MDText';
import { MDInput } from './MDInput';
import { MDModal } from './MDModal';
import { useHoverPress } from './useHoverPress';
import { webTransition } from './webStyles';

interface MDSelectModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  searchPlaceholder?: string;
}

function OptionRow({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { hovered, hoverHandlers } = useHoverPress();
  return (
    <Pressable
      onPress={onPress}
      {...hoverHandlers}
      style={[
        webTransition,
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          borderRadius: radius.sm,
          backgroundColor: hovered ? colors.gray[100] : 'transparent',
        },
      ]}
    >
      <MDText variant="bodySm" weight={active ? '700' : '400'} style={{ color: active ? colors.brand.primary : colors.text.primary }}>
        {label}
      </MDText>
      {active ? <Ionicons name="checkmark" size={16} color={colors.brand.primary} /> : null}
    </Pressable>
  );
}

/** Generic searchable single-select list, used for Country / State pickers. */
export function MDSelectModal({ visible, onClose, title, options, value, onChange, searchPlaceholder }: MDSelectModalProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <MDModal visible={visible} onClose={onClose} title={title} maxWidth={380}>
      <View style={{ gap: spacing.sm }}>
        {options.length > 6 ? (
          <MDInput
            value={query}
            onChangeText={setQuery}
            placeholder={searchPlaceholder ?? 'Search…'}
            leftIcon={<Ionicons name="search" size={15} color={colors.text.tertiary} />}
          />
        ) : null}
        <ScrollView style={{ maxHeight: 320 }}>
          <View style={{ gap: 2 }}>
            {filtered.length === 0 ? (
              <MDText variant="bodySm" tone="tertiary" style={{ padding: spacing.md }}>
                No matches.
              </MDText>
            ) : (
              filtered.map((option) => (
                <OptionRow
                  key={option}
                  label={option}
                  active={option === value}
                  onPress={() => {
                    onChange(option);
                    setQuery('');
                    onClose();
                  }}
                />
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </MDModal>
  );
}
