import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDModal, MDText } from '@/design-system';
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

export function ProductSortMenu({ value, onChange }: ProductSortMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        }}
      >
        <Ionicons name="swap-vertical-outline" size={16} color={colors.text.secondary} />
        <MDText variant="bodySm">{SORT_LABELS[value]}</MDText>
      </Pressable>

      <MDModal visible={open} onClose={() => setOpen(false)} title="Sort By" maxWidth={360}>
        <View style={{ gap: spacing.xs }}>
          {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.sm,
                borderRadius: radius.md,
                backgroundColor: option === value ? colors.brand.primarySoft : 'transparent',
              }}
            >
              <MDText variant="bodySm" weight={option === value ? '700' : '400'}>
                {SORT_LABELS[option]}
              </MDText>
              {option === value ? (
                <Ionicons name="checkmark" size={16} color={colors.brand.primary} />
              ) : null}
            </Pressable>
          ))}
        </View>
      </MDModal>
    </>
  );
}
