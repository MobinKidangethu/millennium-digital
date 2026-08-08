import { ScrollView, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { colors, radius, spacing, MDSkeleton, MDSwitch, MDText } from '@/design-system';
import { useManufacturers, productKeys } from '@/features/products';
import { useCatalogMetaStore } from '@/state';
import { MDManufacturerLogo } from '@/components/MDManufacturerLogo';

export default function ManufacturerManagement() {
  const queryClient = useQueryClient();
  const { data: manufacturers, isLoading } = useManufacturers({ includeDisabled: true });
  const toggleManufacturer = useCatalogMetaStore((s) => s.toggleManufacturer);

  const handleToggle = (name: string) => {
    toggleManufacturer(name);
    queryClient.invalidateQueries({ queryKey: productKeys.manufacturers });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl }}>
        <MDText variant="h1" style={{ marginBottom: spacing.xs }}>
          Manufacturers
        </MDText>
        <MDText variant="body" tone="secondary" style={{ marginBottom: spacing.xl }}>
          Manufacturers are derived automatically from the product catalog. Disable one to hide it
          from buyer browsing without removing its products.
        </MDText>

        {isLoading ? (
          <MDSkeleton height={300} />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {manufacturers?.map((manufacturer) => (
              <View
                key={manufacturer.slug}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.lg,
                  backgroundColor: colors.surfaceRaised,
                  opacity: manufacturer.disabled ? 0.6 : 1,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <MDManufacturerLogo manufacturer={manufacturer.name} width={100} height={28} />
                  <MDText variant="caption" tone="tertiary">
                    {manufacturer.productCount} product{manufacturer.productCount === 1 ? '' : 's'}
                  </MDText>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <MDText variant="caption" tone="secondary">
                    {manufacturer.disabled ? 'Hidden' : 'Visible'}
                  </MDText>
                  <MDSwitch
                    value={!manufacturer.disabled}
                    onValueChange={() => handleToggle(manufacturer.name)}
                    accessibilityLabel={`Toggle ${manufacturer.name}`}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
