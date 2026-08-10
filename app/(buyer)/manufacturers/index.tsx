import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  radius,
  shadow,
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
import { MDBreadcrumb } from '@/components/MDBreadcrumb';
import { LINE_CARD_BRANDS, type LineCardBrand } from '@/constants/lineCardBrands';
import { manufacturerInitials } from '@/utils';
import type { Manufacturer } from '@/types';

/** Loose case-insensitive match so "Renesas" (line card) links to "Renesas Electronics" (catalog), etc. */
function findCatalogMatch(brand: string, manufacturers: Manufacturer[]): Manufacturer | undefined {
  const b = brand.toLowerCase();
  return manufacturers.find((m) => {
    const n = m.name.toLowerCase();
    return n === b || n.includes(b) || b.includes(n);
  });
}

function LineCardTile({ brand, logoUrl, match }: { brand: string; logoUrl: string; match?: Manufacturer }) {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const { hovered, pressed, hoverHandlers, pressHandlers } = useHoverPress();
  const clickable = !!match;

  return (
    <Pressable
      disabled={!clickable}
      onPress={() => match && router.push({ pathname: '/(buyer)/manufacturers/[slug]', params: { slug: match.slug } })}
      accessibilityLabel={clickable ? `${brand} — browse products` : `${brand} — authorized brand, sourced on request`}
      {...hoverHandlers}
      {...pressHandlers}
      style={[
        webTransition,
        {
          width: 148,
          borderWidth: 1,
          borderColor: clickable && hovered ? colors.brand.primary : colors.border,
          borderRadius: radius.lg,
          backgroundColor: colors.surfaceRaised,
          padding: spacing.md,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          minHeight: 108,
          position: 'relative',
          transform: [
            { translateY: clickable && hovered && !pressed ? -3 : 0 },
            { scale: pressed && clickable ? 0.98 : 1 },
          ],
        },
        clickable && hovered ? shadow.hover : shadow.sm,
      ]}
    >
      {clickable ? (
        <View style={{ position: 'absolute', top: 8, right: 8 }}>
          <Ionicons name="checkmark-circle" size={14} color={colors.status.success} />
        </View>
      ) : null}

      {!failed ? (
        <Image
          source={{ uri: logoUrl }}
          style={{ width: '100%', height: 36 }}
          resizeMode="contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: radius.pill,
            backgroundColor: colors.brand.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MDText variant="caption" weight="700" style={{ color: colors.brand.primary }}>
            {manufacturerInitials(brand)}
          </MDText>
        </View>
      )}
      <MDText
        variant="caption"
        weight={clickable ? '600' : '400'}
        tone={clickable ? 'primary' : 'secondary'}
        numberOfLines={1}
        align="center"
      >
        {brand}
      </MDText>
    </Pressable>
  );
}

export default function ManufacturerListing() {
  const router = useRouter();
  const { data: manufacturers, isLoading } = useManufacturers();
  useResponsive();
  const [showAllBrands, setShowAllBrands] = useState(false);

  const lineCard = useMemo(() => {
    const list = manufacturers ?? [];
    return LINE_CARD_BRANDS.map((entry: LineCardBrand) => ({
      ...entry,
      match: findCatalogMatch(entry.name, list),
    })).sort((a, b) => Number(!!b.match) - Number(!!a.match) || a.name.localeCompare(b.name));
  }, [manufacturers]);
  const visibleLineCard = showAllBrands ? lineCard : lineCard.slice(0, 30);
  const searchableCount = lineCard.filter((b) => b.match).length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <View style={{ marginBottom: spacing.lg }}>
          <MDBreadcrumb items={[{ label: 'Home', href: '/(buyer)' }, { label: 'Manufacturers' }]} />
        </View>
        <MDText variant="h1">Manufacturer &amp; Supplier Directory</MDText>
        <MDText variant="body" tone="secondary" style={{ marginTop: spacing.xs, marginBottom: spacing.md, maxWidth: 680 }}>
          Millennium Digital's full authorized distributor network — {LINE_CARD_BRANDS.length} brand
          partners worldwide, sourced from our published line card. {searchableCount} are already
          searchable in the live catalog (marked <Ionicons name="checkmark-circle" size={12} color={colors.status.success} />,
          tap to browse); the rest are sourced on request through our procurement team.
        </MDText>

        {isLoading ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing['2xl'] }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <MDSkeleton key={i} width={148} height={108} />
            ))}
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.lg }}>
              {visibleLineCard.map((entry) => (
                <LineCardTile key={entry.name} brand={entry.name} logoUrl={entry.logoUrl} match={entry.match} />
              ))}
            </View>
            {lineCard.length > visibleLineCard.length ? (
              <MDButton
                label={`Show All ${lineCard.length} Brands`}
                variant="ghost"
                size="sm"
                style={{ marginBottom: spacing['2xl'], alignSelf: 'flex-start' }}
                onPress={() => setShowAllBrands(true)}
              />
            ) : (
              <View style={{ marginBottom: spacing['2xl'] }} />
            )}
          </>
        )}

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.md,
            backgroundColor: colors.gray[900],
            borderRadius: radius.lg,
            padding: spacing.xl,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1, minWidth: 240 }}>
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
