import { useMemo, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, useHoverPress, webTransition, MDText } from '@/design-system';
import type { Category, Manufacturer } from '@/types';

/**
 * Real, computed catalog data — no invented numbers. Categories and
 * manufacturers come straight from useCategories()/useManufacturers()
 * (both strictly derived from products.json), and rohsCount/rohsPct are
 * computed from the live product list on the homepage. This replaces the
 * old static icon+text "Built for Engineering & Procurement" cards with
 * an actual data visualization of the current catalog.
 */
const ACCENTS = [colors.brand.primary, colors.teal[500], colors.status.success, colors.amber[500], colors.plum[400], colors.teal[700]];

function InsightBarRow({
  label,
  count,
  maxCount,
  color,
  onPress,
}: {
  label: string;
  count: number;
  maxCount: number;
  color: string;
  onPress?: () => void;
}) {
  const { hovered, pressed, hoverHandlers, pressHandlers } = useHoverPress();
  const pct = maxCount > 0 ? Math.max((count / maxCount) * 100, 6) : 0;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      {...hoverHandlers}
      {...pressHandlers}
      style={[webTransition, { gap: 6, opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm }}>
        <MDText variant="caption" weight={hovered ? '700' : '600'} numberOfLines={1} style={{ flex: 1 }}>
          {label}
        </MDText>
        <MDText variant="caption" tone="secondary" weight="700">
          {count}
        </MDText>
      </View>
      <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: colors.gray[100], overflow: 'hidden' }}>
        <View
          style={[
            webTransition,
            { height: '100%', width: `${pct}%`, borderRadius: radius.pill, backgroundColor: color },
          ]}
        />
      </View>
    </Pressable>
  );
}

function RohsDonut({ pct }: { pct: number }) {
  const size = 96;
  const strokeWidth = 10;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, pct)) / 100) * c;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.gray[100]} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.status.success}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <MDText variant="h3">{pct}%</MDText>
      </View>
    </View>
  );
}

function PanelShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 240,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.surfaceRaised,
        padding: spacing.lg,
        gap: spacing.md,
      }}
    >
      <View>
        <MDText variant="bodyMedium">{title}</MDText>
        <MDText variant="caption" tone="tertiary">
          {subtitle}
        </MDText>
      </View>
      {children}
    </View>
  );
}

export function CatalogIntelligencePanel({
  categories,
  manufacturers,
  rohsCount,
  rohsPct,
  totalCount,
  isDesktopUp,
}: {
  categories?: Category[];
  manufacturers?: Manufacturer[];
  rohsCount: number;
  rohsPct: number;
  totalCount: number;
  isDesktopUp: boolean;
}) {
  const router = useRouter();

  const topCategories = useMemo(
    () => [...(categories ?? [])].sort((a, b) => b.productCount - a.productCount).slice(0, 6),
    [categories]
  );
  const topManufacturers = useMemo(
    () => [...(manufacturers ?? [])].sort((a, b) => b.productCount - a.productCount).slice(0, 6),
    [manufacturers]
  );
  const categoryMax = topCategories[0]?.productCount ?? 1;
  const manufacturerMax = topManufacturers[0]?.productCount ?? 1;

  return (
    <View style={{ flexDirection: isDesktopUp ? 'row' : 'column', gap: spacing.lg }}>
      <PanelShell title="Catalog by Category" subtitle={`${totalCount} parts across ${categories?.length ?? 0} categories`}>
        <View style={{ gap: spacing.sm }}>
          {topCategories.map((cat, i) => (
            <InsightBarRow
              key={cat.slug}
              label={cat.name}
              count={cat.productCount}
              maxCount={categoryMax}
              color={ACCENTS[i % ACCENTS.length]}
              onPress={() => router.push({ pathname: '/(buyer)/category/[slug]', params: { slug: cat.slug } })}
            />
          ))}
        </View>
      </PanelShell>

      <PanelShell title="Top Manufacturers by SKU Count" subtitle={`${manufacturers?.length ?? 0} verified manufacturers live in catalog`}>
        <View style={{ gap: spacing.sm }}>
          {topManufacturers.map((m, i) => (
            <InsightBarRow
              key={m.slug}
              label={m.name}
              count={m.productCount}
              maxCount={manufacturerMax}
              color={ACCENTS[i % ACCENTS.length]}
              onPress={() => router.push({ pathname: '/(buyer)/manufacturers/[slug]', params: { slug: m.slug } })}
            />
          ))}
        </View>
      </PanelShell>

      <PanelShell title="RoHS Compliance" subtitle={`${rohsCount} of ${totalCount} parts compliant`}>
        <View style={{ alignItems: 'center', paddingVertical: spacing.sm }}>
          <RohsDonut pct={rohsPct} />
        </View>
      </PanelShell>
    </View>
  );
}
