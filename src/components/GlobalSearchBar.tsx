import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, TextInput, View, useWindowDimensions, type ViewStyle } from 'react-native';
import { createPortal } from 'react-dom';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, zIndex, useHoverPress, webTransition, MDText } from '@/design-system';
import { useProducts } from '@/features/products';
import { useCategories } from '@/features/categories';
import { useManufacturers } from '@/features/manufacturers';
import { SITE_SEARCH_INDEX } from '@/constants/siteSearchIndex';
import { MDProductImage } from '@/components/MDProductImage';
import { formatDisplayPrice } from '@/utils';
import { useCurrencyStore } from '@/state';
import { noWebOutline } from '@/design-system/webStyles';
import type { Product } from '@/types';

const MAX_PAGES = 4;
const MAX_CATEGORIES = 3;
const MAX_MANUFACTURERS = 3;
const MAX_PRODUCTS = 5;

/**
 * Header search — searches across the whole app, not just the product
 * catalog: app sections/workflows (SITE_SEARCH_INDEX), categories,
 * manufacturers, and products (via the existing useProducts search filter),
 * with a live autocomplete dropdown. Also docks an "Upload BOM" shortcut
 * inside the bar itself since BOM upload is one of the platform's primary
 * entry points alongside search.
 *
 * The results panel renders through a `document.body` portal on web (see
 * `DropdownPortal` below) instead of as a plain absolutely-positioned child.
 * React Native Web gives any ancestor with a `transform`/`overflow` (e.g.
 * the route Stack's screen container, a carousel, an animated hero banner)
 * its own CSS stacking context, which silently traps a nested `zIndex` and
 * lets later page content paint over it. Portaling to `document.body` and
 * positioning from a measured screen anchor sidesteps that entirely so the
 * dropdown always renders above the rest of the page, on every screen.
 */
export function GlobalSearchBar({ style }: { style?: object }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<{ top: number; left: number; width: number } | null>(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const clearHover = useHoverPress();
  const bomHover = useHoverPress();
  const seeAllHover = useHoverPress();

  const trimmed = query.trim();
  const showDropdown = focused && trimmed.length > 0;

  const measureAnchor = () => {
    containerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ top: y + height + 4, left: x, width });
    });
  };

  // Re-measure whenever the dropdown opens and whenever the viewport
  // resizes while it's open, so the portal stays glued under the bar.
  useEffect(() => {
    if (showDropdown) measureAnchor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDropdown, windowWidth, windowHeight]);

  const { data: categories } = useCategories();
  const { data: manufacturers } = useManufacturers();
  const { data: productMatches } = useProducts(
    { search: trimmed, sort: 'relevance' },
    { enabled: trimmed.length >= 2 },
  );

  const matchedPages = useMemo(() => {
    if (!trimmed) return [];
    const q = trimmed.toLowerCase();
    return SITE_SEARCH_INDEX.filter(
      (entry) => entry.label.toLowerCase().includes(q) || entry.keywords.some((k) => k.includes(q)),
    ).slice(0, MAX_PAGES);
  }, [trimmed]);

  const matchedCategories = useMemo(() => {
    if (!trimmed || !categories) return [];
    const q = trimmed.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q)).slice(0, MAX_CATEGORIES);
  }, [trimmed, categories]);

  const matchedManufacturers = useMemo(() => {
    if (!trimmed || !manufacturers) return [];
    const q = trimmed.toLowerCase();
    return manufacturers.filter((m) => m.name.toLowerCase().includes(q)).slice(0, MAX_MANUFACTURERS);
  }, [trimmed, manufacturers]);

  const products = (productMatches ?? []).slice(0, MAX_PRODUCTS);

  const hasResults =
    matchedPages.length > 0 || matchedCategories.length > 0 || matchedManufacturers.length > 0 || products.length > 0;

  const close = () => setFocused(false);

  const handleBlur = () => {
    // Delay so a result's onPress fires before the dropdown unmounts.
    blurTimer.current = setTimeout(close, 150);
  };

  const handleFocus = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setFocused(true);
    measureAnchor();
  };

  const submitFullSearch = () => {
    if (!trimmed) return;
    close();
    router.push({ pathname: '/(buyer)/search', params: { q: trimmed } });
  };

  const goTo = (href: string) => {
    close();
    router.push(href as never);
  };

  return (
    <View ref={containerRef} style={[{ position: 'relative' }, style]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: focused ? colors.brand.primary : colors.border,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          height: 44,
        }}
      >
        <Ionicons name="search" size={18} color={colors.text.tertiary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search products, categories, manufacturers, or tools…"
          placeholderTextColor={colors.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={submitFullSearch}
          returnKeyType="search"
          style={[
            {
              flex: 1,
              height: '100%',
              fontSize: 14,
              lineHeight: 18,
              paddingVertical: 0,
              color: colors.text.primary,
            },
            noWebOutline,
          ]}
        />
        {query.length > 0 ? (
          <Pressable
            accessibilityLabel="Clear search"
            onPress={() => setQuery('')}
            {...clearHover.hoverHandlers}
            style={[webTransition, { transform: [{ scale: clearHover.hovered ? 1.15 : 1 }] }]}
          >
            <Ionicons name="close-circle" size={18} color={clearHover.hovered ? colors.text.secondary : colors.text.tertiary} />
          </Pressable>
        ) : null}

        <View style={{ width: 1, height: 22, backgroundColor: colors.border }} />

        <Pressable
          accessibilityLabel="Upload a BOM to request a quote"
          onPress={() => goTo('/(buyer)/bom')}
          {...bomHover.hoverHandlers}
          style={[
            webTransition,
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              opacity: bomHover.hovered ? 0.75 : 1,
            },
          ]}
        >
          <Ionicons name="document-attach-outline" size={16} color={colors.brand.primary} />
          <MDText variant="caption" weight="700" style={{ color: colors.brand.primary }}>
            Upload BOM / RFQ
          </MDText>
        </Pressable>
      </View>

      {showDropdown ? (
        <DropdownPortal anchor={anchor}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {!hasResults ? (
              <View style={{ padding: spacing.lg, alignItems: 'center' }}>
                <MDText variant="bodySm" tone="tertiary">
                  No matches for "{trimmed}"
                </MDText>
              </View>
            ) : (
              <View style={{ paddingVertical: spacing.xs }}>
                {matchedPages.length > 0 ? (
                  <DropdownSection label="Pages & Tools">
                    {matchedPages.map((entry) => (
                      <ResultRow
                        key={entry.href}
                        icon={entry.icon}
                        title={entry.label}
                        subtitle={entry.description}
                        onPress={() => goTo(entry.href)}
                      />
                    ))}
                  </DropdownSection>
                ) : null}

                {matchedCategories.length > 0 ? (
                  <DropdownSection label="Categories">
                    {matchedCategories.map((c) => (
                      <ResultRow
                        key={c.slug}
                        icon="grid-outline"
                        title={c.name}
                        subtitle={`${c.productCount} product${c.productCount === 1 ? '' : 's'}`}
                        onPress={() => goTo(`/(buyer)/category/${c.slug}`)}
                      />
                    ))}
                  </DropdownSection>
                ) : null}

                {matchedManufacturers.length > 0 ? (
                  <DropdownSection label="Manufacturers">
                    {matchedManufacturers.map((m) => (
                      <ResultRow
                        key={m.slug}
                        icon="business-outline"
                        title={m.name}
                        subtitle={`${m.productCount} product${m.productCount === 1 ? '' : 's'}`}
                        onPress={() => goTo(`/(buyer)/manufacturers/${m.slug}`)}
                      />
                    ))}
                  </DropdownSection>
                ) : null}

                {products.length > 0 ? (
                  <DropdownSection label="Products">
                    {products.map((product) => (
                      <ProductResultRow
                        key={product.id}
                        product={product}
                        onPress={() =>
                          goTo(
                            `/(buyer)/products/${product.manufacturerSlug}/${product.partSlug}`,
                          )
                        }
                      />
                    ))}
                  </DropdownSection>
                ) : null}
              </View>
            )}

            <Pressable
              onPress={submitFullSearch}
              {...seeAllHover.hoverHandlers}
              style={[
                webTransition,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  paddingVertical: spacing.sm,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  backgroundColor: seeAllHover.hovered ? colors.surface : colors.surfaceRaised,
                },
              ]}
            >
              <MDText variant="caption" weight="700" style={{ color: colors.brand.primary }}>
                See all results for "{trimmed}"
              </MDText>
              <Ionicons name="arrow-forward" size={12} color={colors.brand.primary} />
            </Pressable>
          </ScrollView>
        </DropdownPortal>
      ) : null}
    </View>
  );
}

/**
 * Renders `children` in the dropdown's panel chrome, positioned from a
 * measured screen anchor. On web it portals straight to `document.body` so
 * no ancestor stacking context can bury it; on native it falls back to a
 * normal absolutely-positioned sibling (native has no CSS stacking-context
 * equivalent, so the plain approach is fine there).
 */
function DropdownPortal({
  anchor,
  children,
}: {
  anchor: { top: number; left: number; width: number } | null;
  children: React.ReactNode;
}) {
  const panelStyle = [
    {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      maxHeight: 440,
      overflow: 'hidden' as const,
    },
    shadow.lg,
  ];

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    if (!anchor) return null;
    const fixedStyle = {
      position: 'fixed',
      top: anchor.top,
      left: anchor.left,
      width: anchor.width,
      zIndex: zIndex.modal,
    } as unknown as ViewStyle;
    return createPortal(<View style={[fixedStyle, ...panelStyle]}>{children}</View>, document.body);
  }

  return (
    <View
      style={[
        { position: 'absolute', top: 48, left: 0, right: 0, zIndex: zIndex.dropdown },
        ...panelStyle,
      ]}
    >
      {children}
    </View>
  );
}

function DropdownSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: spacing.xs }}>
      <MDText
        variant="overline"
        tone="tertiary"
        style={{ paddingHorizontal: spacing.md, paddingVertical: 4 }}
      >
        {label.toUpperCase()}
      </MDText>
      {children}
    </View>
  );
}

function ResultRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  const { hovered, hoverHandlers } = useHoverPress();

  return (
    <Pressable
      onPress={onPress}
      {...hoverHandlers}
      style={[
        webTransition,
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          backgroundColor: hovered ? colors.surface : 'transparent',
        },
      ]}
    >
      <Ionicons name={icon} size={16} color={hovered ? colors.brand.primary : colors.text.secondary} />
      <View style={{ flex: 1 }}>
        <MDText variant="bodySm" numberOfLines={1}>
          {title}
        </MDText>
        {subtitle ? (
          <MDText variant="caption" tone="tertiary" numberOfLines={1}>
            {subtitle}
          </MDText>
        ) : null}
      </View>
    </Pressable>
  );
}

function ProductResultRow({ product, onPress }: { product: Product; onPress: () => void }) {
  const { hovered, hoverHandlers } = useHoverPress();
  const displayCurrency = useCurrencyStore((s) => s.currency);

  return (
    <Pressable
      onPress={onPress}
      {...hoverHandlers}
      style={[
        webTransition,
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          backgroundColor: hovered ? colors.surface : 'transparent',
        },
      ]}
    >
      <View style={{ width: 32, height: 32 }}>
        <MDProductImage imagePath={product.image} alt={product.title} style={{ width: '100%', height: '100%' }} />
      </View>
      <View style={{ flex: 1 }}>
        <MDText variant="caption" weight="700" numberOfLines={1}>
          {product.manufacturerPartNumber}
        </MDText>
        <MDText variant="caption" tone="tertiary" numberOfLines={1}>
          {product.manufacturer}
        </MDText>
      </View>
      <MDText variant="caption" weight="600" style={{ color: colors.brand.primary }}>
        {formatDisplayPrice(product.price, product.currency, displayCurrency)}
      </MDText>
    </Pressable>
  );
}
