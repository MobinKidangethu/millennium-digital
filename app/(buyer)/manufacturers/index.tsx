import { ScrollView, View } from 'react-native';
import { colors, spacing, layout, useResponsive, MDText, MDSkeleton } from '@/design-system';
import { useManufacturers } from '@/features/manufacturers';
import { MDManufacturerCard } from '@/components/MDManufacturerCard';

export default function ManufacturerListing() {
  const { data: manufacturers, isLoading } = useManufacturers();
  const { isDesktopUp, isTabletUp } = useResponsive();
  const columns = isDesktopUp ? 4 : isTabletUp ? 3 : 2;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <MDText variant="h1">Manufacturers</MDText>
        <MDText variant="body" tone="secondary" style={{ marginTop: spacing.xs, marginBottom: spacing.xl }}>
          Genuine components from verified, authorized manufacturers.
        </MDText>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <View key={i} style={{ width: `${100 / columns - 3}%` }}>
                  <MDSkeleton height={128} />
                </View>
              ))
            : manufacturers?.map((manufacturer) => (
                <View key={manufacturer.slug} style={{ width: `${100 / columns - 3}%` }}>
                  <MDManufacturerCard manufacturer={manufacturer} />
                </View>
              ))}
        </View>
      </View>
    </ScrollView>
  );
}
