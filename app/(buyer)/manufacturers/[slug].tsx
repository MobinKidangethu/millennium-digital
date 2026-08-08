import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, spacing, layout, MDEmptyState, MDText } from '@/design-system';
import { useManufacturer } from '@/features/manufacturers';
import { MDManufacturerLogo } from '@/components/MDManufacturerLogo';
import { ProductCatalogView } from '@/components/ProductCatalogView';

export default function ManufacturerDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: manufacturer, isLoading } = useManufacturer(slug);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (!manufacturer) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <MDEmptyState title="Manufacturer not found" description="This manufacturer may have been renamed or removed." />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.lg,
            marginBottom: spacing.xl,
            paddingBottom: spacing.xl,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <MDManufacturerLogo manufacturer={manufacturer.name} width={160} height={44} />
          <View>
            <MDText variant="h2">{manufacturer.name}</MDText>
            <MDText variant="body" tone="secondary">
              {manufacturer.productCount} product{manufacturer.productCount === 1 ? '' : 's'} available
            </MDText>
          </View>
        </View>

        <ProductCatalogView
          title="Products"
          initialFilters={{ manufacturer: [manufacturer.name] }}
          hideManufacturerFilter
        />
      </View>
    </ScrollView>
  );
}
