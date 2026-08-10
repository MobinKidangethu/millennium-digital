import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, useHoverPress, webTransition, MDModal, MDText } from '@/design-system';
import type { SortOption } from '@/types';

const SORT_LABELS: Record<SortOption, string> = {
  relevance: 'Relevance',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  'part-number': 'Part Number (A–Z)',
  newest: 'Newest First',
};

interface ProductSortMenuProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

function SortOptionRow({
  option,
  active,
  onPress,
}: {
  option: SortOption;
  active: boolean;
  onPress: () => void;
}) {
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
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.sm,
          borderRadius: radius.md,
          backgroundColor: active ? colors.brand.primarySoft : hovered ? colors.surface : 'transparent',
        },
      ]}
    >
      <MDText variant="bodySm" weight={active ? '700' : '400'}>
        {SORT_LABELS[option]}
      </MDText>
      {active ? <Ionicons name="checkmark" size={16} color={colors.brand.primary} /> : null}
    </Pressable>
  );
}

export function ProductSortMenu({ value, onChange }: ProductSortMenuProps) {
  const [open, setOpen] = useState(false);
  const { hovered, hoverHandlers } = useHoverPress();

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        {...hoverHandlers}
        style={[
          webTransition,
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            borderWidth: 1,
            borderColor: hovered ? colors.brand.primary : colors.border,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            backgroundColor: hovered ? colors.surface : 'transparent',
          },
        ]}
      >
        <Ionicons name="swap-vertical-outline" size={16} color={hovered ? colors.brand.primary : colors.text.secondary} />
        <MDText variant="bodySm">{SORT_LABELS[value]}</MDText>
      </Pressable>

      <MDModal visible={open} onClose={() => setOpen(false)} title="Sort By" maxWidth={360}>
        <View style={{ gap: spacing.xs }}>
          {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
            <SortOptionRow
              key={option}
              option={option}
              active={option === value}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
            />
          ))}
        </View>
      </MDModal>
    </>
  );
}
