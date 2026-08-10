import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  radius,
  spacing,
  layout,
  useResponsive,
  useHoverPress,
  webTransition,
  MDButton,
  MDText,
  MDSkeleton,
} from '@/design-system';
import { useManufacturers } from '@/features/manufacturers';
import { MDManufacturerCard } from '@/components/MDManufacturerCard';
import { MDBreadcrumb } from '@/components/MDBreadcrumb';
import { LINE_CARD_BRANDS } from '@/constants/lineCardBrands';
import type { Manufacturer } from '@/types';

/** Loose case-insensitive match so "Renesas" (line card) links to "Renesas Electronics" (catalog), etc. */
function findCatalogMatch(brand: string, manufacturers: Manufacturer[]): Manufacturer | undefined {
  const b = brand.toLowerCase();
  return manufacturers.find((m) => {
    const n = m.name.toLowerCase();
    return n === b || n.includes(b) || b.includes(n);
  });
}

function LineCardChip({ brand, match }: { brand: string; match?: Manufacturer }) {
  const router = useRouter();
  const { hovered, hoverHandlers } = useHoverPress();
  const clickable = !!match;

  return (
    <Pressable
      disabled={!clickable}
      onPress={() => match && router.push({ pathname: '/(buyer)/manufacturers/[slug]', params: { slug: match.slug } })}
      {...hoverHandlers}
      style={[
        webTransition,
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          borderWidth: 1,
          borderColor: clickable && hovered ? colors.brand.primary : colors.border,
          backgroundColor: clickable && hovered ? colors.brand.primarySoft : colors.surfaceRaised,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
        },
      ]}
    >
      <MDText variant="bodySm" weight={clickable ? '600' : '400'} style={{ color: clickable ? colors.brand.primary : colors.text.secondary }}>
        {brand}
      </MDText>
      {clickable ? <Ionicons name="arrow-forward" size={11} color={colors.brand.primary} /> : null}
    </Pressable>
  );
}

export default function ManufacturerListing() {
  const router = useRouter();
  const { data: manufacturers, isLoading } = useManufacturers();
  const { isDesktopUp, isTabletUp } = useResponsive();
  const columns = isDesktopUp ? 4 : isTabletUp ? 3 : 2;
  const [showAllBrands, setShowAllBrands] = useState(false);

  const lineCard = useMemo(() => {
    const list = manufacturers ?? [];
    return LINE_CARD_BRANDS.map((brand) => ({ brand, match: findCatalogMatch(brand, list) })).sort(
      (a, b) => Number(!!b.match) - Number(!!a.match) || a.brand.localeCompare(b.brand),
    );
  }, [manufacturers]);
  const visibleLineCard = showAllBrands ? lineCard : lineCard.slice(0, 24);
  const searchableCount = lineCard.filter((b) => b.match).length;

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

        <View style={{ marginBottom: spacing['2xl'] }}>
          <MDText variant="h2" style={{ marginBottom: 4 }}>
            Global Line Card
          </MDText>
          <MDText variant="bodySm" tone="secondary" style={{ marginBottom: spacing.lg, maxWidth: 640 }}>
            Millennium Digital's full authorized distributor network — {LINE_CARD_BRANDS.length} brand
            partners worldwide. {searchableCount} are already searchable in the live catalog above
            (highlighted, tap to browse); the rest are sourced on request through our procurement team.
          </MDText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {visibleLineCard.map(({ brand, match }) => (
              <LineCardChip key={brand} brand={brand} match={match} />
            ))}
          </View>
          {lineCard.length > visibleLineCard.length ? (
            <MDButton
              label={`Show All ${lineCard.length} Brands`}
              variant="ghost"
              size="sm"
              style={{ marginTop: spacing.md, alignSelf: 'flex-start' }}
              onPress={() => setShowAllBrands(true)}
            />
          ) : null}
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
