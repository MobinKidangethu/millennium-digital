import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDButton, MDInput, MDText } from '@/design-system';
import type { FilterOption } from '@/features/products';
import type { ProductFilters } from '@/types';

interface FilterSectionProps {
  title: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
  defaultOpen?: boolean;
}

function FilterSection({ title, options, selected, onToggle, defaultOpen = true }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  if (options.length === 0) return null;

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: spacing.md }}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <MDText variant="bodyMedium">{title}</MDText>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.text.tertiary} />
      </Pressable>

      {open ? (
        <View style={{ marginTop: spacing.sm, gap: spacing.sm }}>
          {options.map((option) => {
            const checked = selected.includes(option.value);
            return (
              <Pressable
                key={option.value}
                onPress={() => onToggle(option.value)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: radius.sm - 2,
                    borderWidth: 1.5,
                    borderColor: checked ? colors.brand.primary : colors.borderStrong,
                    backgroundColor: checked ? colors.brand.primary : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {checked ? <Ionicons name="checkmark" size={13} color={colors.gray[0]} /> : null}
                </View>
                <MDText variant="bodySm" style={{ flex: 1 }} numberOfLines={1}>
                  {option.label}
                </MDText>
                <MDText variant="caption" tone="tertiary">
                  {option.count}
                </MDText>
              </Pressable>
            );
          })}
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
  onClearAll: () => void;
  hideCategory?: boolean;
  hideManufacturer?: boolean;
}

export function ProductFilterControls({
  filters,
  optionSets,
  onToggle,
  onSetRohsOnly,
  onSetPriceRange,
  onClearAll,
  hideCategory,
  hideManufacturer,
}: ProductFilterControlsProps) {
  const [minPrice, setMinPrice] = useState(filters.priceMin != null ? String(filters.priceMin) : '');
  const [maxPrice, setMaxPrice] = useState(filters.priceMax != null ? String(filters.priceMax) : '');

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
        <MDText variant="h4">Filters</MDText>
        <MDButton label="Clear All" variant="ghost" size="sm" onPress={onClearAll} />
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

      <View style={{ paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <MDText variant="bodyMedium" style={{ marginBottom: spacing.sm }}>
          Price Range
        </MDText>
        <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
          <MDInput
            value={minPrice}
            onChangeText={setMinPrice}
            placeholder="Min"
            keyboardType="numeric"
            style={{ flex: 1 }}
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
            style={{ flex: 1 }}
            onSubmitEditing={() =>
              onSetPriceRange(minPrice ? Number(minPrice) : undefined, maxPrice ? Number(maxPrice) : undefined)
            }
          />
        </View>
        <MDButton
          label="Apply"
          size="sm"
          variant="outline"
          style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}
          onPress={() => onSetPriceRange(minPrice ? Number(minPrice) : undefined, maxPrice ? Number(maxPrice) : undefined)}
        />
      </View>

      <Pressable
        onPress={() => onSetRohsOnly(!filters.rohsOnly)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: !!filters.rohsOnly }}
      >
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: radius.sm - 2,
            borderWidth: 1.5,
            borderColor: filters.rohsOnly ? colors.brand.primary : colors.borderStrong,
            backgroundColor: filters.rohsOnly ? colors.brand.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {filters.rohsOnly ? <Ionicons name="checkmark" size={13} color={colors.gray[0]} /> : null}
        </View>
        <MDText variant="bodySm">RoHS Compliant Only</MDText>
      </Pressable>
    </View>
  );
}
