import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, layout, useResponsive, MDButton, MDText, MDSkeleton } from '@/design-system';
import { useManufacturers } from '@/features/manufacturers';
import { MDManufacturerCard } from '@/components/MDManufacturerCard';
import { MDBreadcrumb } from '@/components/MDBreadcrumb';

export default function ManufacturerListing() {
  const router = useRouter();
  const { data: manufacturers, isLoading } = useManufacturers();
  const { isDesktopUp, isTabletUp } = useResponsive();
  const columns = isDesktopUp ? 4 : isTabletUp ? 3 : 2;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <View style={{ marginBottom: spacing.lg }}>
          <MDBreadcrumb items={[{ label: 'Home', href: '/(buyer)' }, { label: 'Manufacturers' }]} />
        </View>
        <MDText variant="h1">Manufacturer &amp; Supplier Directory</MDText>
        <MDText variant="body" tone="secondary" style={{ marginTop: spacing.xs, marginBottom: spacing.xl, maxWidth: 640 }}>
          Genuine components from verified, authorized manufacturers — each profile shows real portfolio
          breadth, RoHS coverage, and documentation drawn from the live catalog.
        </MDText>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, marginBottom: spacing['2xl'] }}>
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

        <View
          style={{
            flexDirection: isDesktopUp ? 'row' : 'column',
            alignItems: isDesktopUp ? 'center' : 'flex-start',
            justifyContent: 'space-between',
            gap: spacing.md,
            backgroundColor: colors.gray[900],
            borderRadius: radius.lg,
            padding: spacing.xl,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
            <Ionicons name="business" size={24} color={colors.gray[0]} />
            <View style={{ flex: 1 }}>
              <MDText variant="h4" style={{ color: colors.gray[0] }}>
                Are you a manufacturer or distributor?
              </MDText>
              <MDText variant="bodySm" style={{ color: colors.gray[400], marginTop: 2 }}>
                Join the Millennium Digital marketplace and reach engineers searching by spec, not just by name.
              </MDText>
            </View>
          </View>
          <MDButton label="Become a Supplier" variant="secondary" onPress={() => router.push('/(buyer)/suppliers')} />
        </View>
      </View>
    </ScrollView>
  );
}
