import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, useHoverPress, webTransition, MDButton, MDInput, MDText } from '@/design-system';
import type { FilterOption } from '@/features/products';
import type { ProductFilters } from '@/types';

interface FilterSectionProps {
  title: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
  defaultOpen?: boolean;
}

function FilterOptionRow({
  option,
  checked,
  onPress,
}: {
  option: FilterOption;
  checked: boolean;
  onPress: () => void;
}) {
  const { hovered, hoverHandlers } = useHoverPress();

  return (
    <Pressable
      onPress={onPress}
      {...hoverHandlers}
      style={[webTransition, { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minWidth: 0, borderRadius: radius.sm, paddingVertical: 2, paddingHorizontal: 2, backgroundColor: hovered ? colors.surface : 'transparent' }]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        style={{
          width: 15,
          height: 15,
          borderRadius: radius.sm - 3,
          borderWidth: 1.5,
          borderColor: checked ? colors.brand.primary : hovered ? colors.brand.primary : colors.borderStrong,
          backgroundColor: checked ? colors.brand.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked ? <Ionicons name="checkmark" size={11} color={colors.gray[0]} /> : null}
      </View>
      <MDText variant="caption" style={{ flex: 1, minWidth: 0 }} numberOfLines={1}>
        {option.label}
      </MDText>
      <MDText variant="caption" tone="tertiary">
        {option.count}
      </MDText>
    </Pressable>
  );
}

function FilterSection({ title, options, selected, onToggle, defaultOpen = true }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { hovered, hoverHandlers } = useHoverPress();
  if (options.length === 0) return null;

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: spacing.sm, minWidth: 0 }}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        {...hoverHandlers}
        style={[webTransition, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 2 }]}
      >
        <MDText variant="bodySm" weight="700" style={{ color: hovered ? colors.brand.primary : colors.text.primary }}>
          {title}
        </MDText>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={13} color={hovered ? colors.brand.primary : colors.text.tertiary} />
      </Pressable>

      {open ? (
        <View style={{ marginTop: spacing.xs, gap: 6, minWidth: 0 }}>
          {options.map((option) => (
            <FilterOptionRow
              key={option.value}
              option={option}
              checked={selected.includes(option.value)}
              onPress={() => onToggle(option.value)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

interface ProductFilterControlsProps {
  filters: ProductFilters;
  optionSets: {
    category: FilterOption[];
    manufacturer: FilterOption[];
    productType: FilterOption[];
    technology: FilterOption[];
    mountingStyle: FilterOption[];
    package: FilterOption[];
  };
  onToggle: (key: 'category' | 'manufacturer' | 'productType' | 'technology' | 'mountingStyle' | 'package', value: string) => void;
  onSetRohsOnly: (value: boolean) => void;
  onSetPriceRange: (min?: number, max?: number) => void;
  onSetMinAvailability?: (min?: number) => void;
  onClearAll: () => void;
  hideCategory?: boolean;
  hideManufacturer?: boolean;
}

const AVAILABILITY_TIERS = [
  { label: '100+ units', value: 100 },
  { label: '500+ units', value: 500 },
  { label: '1,000+ units', value: 1000 },
  { label: '5,000+ units', value: 5000 },
];

function AvailabilityChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { hovered, hoverHandlers } = useHoverPress();

  return (
    <Pressable
      onPress={onPress}
      {...hoverHandlers}
      style={[
        webTransition,
        {
          paddingHorizontal: spacing.sm,
          paddingVertical: 3,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: selected || hovered ? colors.brand.primary : colors.borderStrong,
          backgroundColor: selected ? colors.brand.primarySoft : hovered ? colors.gray[50] : 'transparent',
        },
      ]}
    >
      <MDText variant="caption" weight={selected ? '700' : '400'} style={{ color: selected || hovered ? colors.brand.primary : colors.text.secondary }}>
        {label}
      </MDText>
    </Pressable>
  );
}

function ClearAllLink({ onPress }: { onPress: () => void }) {
  const { hovered, hoverHandlers } = useHoverPress();

  return (
    <Pressable onPress={onPress} hitSlop={6} {...hoverHandlers} style={webTransition}>
      <MDText variant="caption" weight="700" style={{ color: colors.brand.primary, textDecorationLine: hovered ? 'underline' : 'none' }}>
        Clear All
      </MDText>
    </Pressable>
  );
}

function RohsToggleRow({ checked, onPress }: { checked: boolean; onPress: () => void }) {
  const { hovered, hoverHandlers } = useHoverPress();

  return (
    <Pressable
      onPress={onPress}
      {...hoverHandlers}
      style={[webTransition, { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm }]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        style={{
          width: 15,
          height: 15,
          borderRadius: radius.sm - 3,
          borderWidth: 1.5,
          borderColor: checked || hovered ? colors.brand.primary : colors.borderStrong,
          backgroundColor: checked ? colors.brand.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked ? <Ionicons name="checkmark" size={11} color={colors.gray[0]} /> : null}
      </View>
      <MDText variant="caption" style={{ color: hovered ? colors.text.primary : colors.text.secondary }}>
        RoHS Compliant Only
      </MDText>
    </Pressable>
  );
}

export function ProductFilterControls({
  filters,
  optionSets,
  onToggle,
  onSetRohsOnly,
  onSetPriceRange,
  onSetMinAvailability,
  onClearAll,
  hideCategory,
  hideManufacturer,
}: ProductFilterControlsProps) {
  const [minPrice, setMinPrice] = useState(filters.priceMin != null ? String(filters.priceMin) : '');
  const [maxPrice, setMaxPrice] = useState(filters.priceMax != null ? String(filters.priceMax) : '');

  return (
    <View style={{ minWidth: 0 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
        <MDText variant="bodyMedium">Filters</MDText>
        <ClearAllLink onPress={onClearAll} />
      </View>

      {!hideCategory ? (
        <FilterSection
          title="Category"
          options={optionSets.category}
          selected={filters.category ?? []}
          onToggle={(v) => onToggle('category', v)}
        />
      ) : null}

      {!hideManufacturer ? (
        <FilterSection
          title="Manufacturer"
          options={optionSets.manufacturer}
          selected={filters.manufacturer ?? []}
          onToggle={(v) => onToggle('manufacturer', v)}
        />
      ) : null}

      <FilterSection
        title="Product Type"
        options={optionSets.productType}
        selected={filters.productType ?? []}
        onToggle={(v) => onToggle('productType', v)}
      />

      <FilterSection
        title="Technology"
        options={optionSets.technology}
        selected={filters.technology ?? []}
        onToggle={(v) => onToggle('technology', v)}
        defaultOpen={false}
      />

      <FilterSection
        title="Mounting Style"
        options={optionSets.mountingStyle}
        selected={filters.mountingStyle ?? []}
        onToggle={(v) => onToggle('mountingStyle', v)}
        defaultOpen={false}
      />

      <FilterSection
        title="Package"
        options={optionSets.package}
        selected={filters.package ?? []}
        onToggle={(v) => onToggle('package', v)}
        defaultOpen={false}
      />

      <View style={{ paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <MDText variant="bodySm" weight="700" style={{ marginBottom: spacing.xs }}>
          Price Range
        </MDText>
        <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center', minWidth: 0 }}>
          <MDInput
            value={minPrice}
            onChangeText={setMinPrice}
            placeholder="Min"
            keyboardType="numeric"
            style={{ flex: 1, minWidth: 0 }}
            onSubmitEditing={() =>
              onSetPriceRange(minPrice ? Number(minPrice) : undefined, maxPrice ? Number(maxPrice) : undefined)
            }
          />
          <MDText tone="tertiary">–</MDText>
          <MDInput
            value={maxPrice}
            onChangeText={setMaxPrice}
            placeholder="Max"
            keyboardType="numeric"
            style={{ flex: 1, minWidth: 0 }}
            onSubmitEditing={() =>
              onSetPriceRange(minPrice ? Number(minPrice) : undefined, maxPrice ? Number(maxPrice) : undefined)
            }
          />
        </View>
        <MDButton
          label="Apply"
          size="sm"
          variant="outline"
          style={{ marginTop: spacing.xs, alignSelf: 'flex-start' }}
          onPress={() => onSetPriceRange(minPrice ? Number(minPrice) : undefined, maxPrice ? Number(maxPrice) : undefined)}
        />
      </View>

      {onSetMinAvailability ? (
        <View style={{ paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <MDText variant="bodySm" weight="700" style={{ marginBottom: spacing.xs }}>
            Availability
          </MDText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {AVAILABILITY_TIERS.map((tier) => {
              const selected = filters.minAvailability === tier.value;
              return (
                <AvailabilityChip
                  key={tier.value}
                  label={tier.label}
                  selected={selected}
                  onPress={() => onSetMinAvailability(selected ? undefined : tier.value)}
                />
              );
            })}
          </View>
        </View>
      ) : null}

      <RohsToggleRow checked={!!filters.rohsOnly} onPress={() => onSetRohsOnly(!filters.rohsOnly)} />
    </View>
  );
}
