import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout, radius, spacing, MDBadge, MDButton, MDSearchBar, MDText } from '@/design-system';
import { useProducts, useProductTypes } from '@/features/products';
import { useSearchStore } from '@/state';
import { MDManufacturerLogo } from '@/components/MDManufacturerLogo';
import { ProductCatalogView } from '@/components/ProductCatalogView';

const REQUIREMENT_WORDS = ['need', 'looking for', 'suitable', 'for automotive', 'for industrial', 'with low', 'above', 'below', 'find a', 'find me'];

/** Lightweight heuristic — a real query router would use the same NLU as AI Search. */
function looksLikeEngineeringRequirement(query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.split(/\s+/).length >= 6) return true;
  return REQUIREMENT_WORDS.some((phrase) => trimmed.includes(phrase));
}

export default function Search() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(q ?? '');
  const [committedQuery, setCommittedQuery] = useState(q ?? '');
  const recentSearches = useSearchStore((s) => s.recentSearches);
  const recordSearch = useSearchStore((s) => s.recordSearch);
  const clearRecent = useSearchStore((s) => s.clear);
  const { data: productTypes } = useProductTypes();

  useEffect(() => {
    if (q) {
      setQuery(q);
      setCommittedQuery(q);
    }
  }, [q]);

  const showSuggestions = query.trim().length >= 2 && query !== committedQuery;
  const { data: suggestions } = useProducts(
    { search: query, sort: 'relevance' },
    { enabled: showSuggestions },
  );

  const submit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    recordSearch(trimmed);
    setCommittedQuery(trimmed);
    setQuery(trimmed);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <View style={{ position: 'relative', marginBottom: spacing.xl, zIndex: 10 }}>
          <MDSearchBar
            value={query}
            onChangeText={setQuery}
            onSubmit={() => submit(query)}
            autoFocus={!q}
          />

          {showSuggestions && suggestions && suggestions.length > 0 ? (
            <View
              style={{
                position: 'absolute',
                top: 50,
                left: 0,
                right: 0,
                backgroundColor: colors.surfaceRaised,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                overflow: 'hidden',
              }}
            >
              {suggestions.slice(0, 6).map((product) => (
                <Pressable
                  key={product.id}
                  onPress={() => {
                    recordSearch(query);
                    router.push({
                      pathname: '/(buyer)/products/[manufacturer]/[part]',
                      params: { manufacturer: product.manufacturerSlug, part: product.partSlug },
                    });
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <MDManufacturerLogo manufacturer={product.manufacturer} width={50} height={16} />
                  <View style={{ flex: 1 }}>
                    <MDText variant="bodySm" weight="600" numberOfLines={1}>
                      {product.manufacturerPartNumber}
                    </MDText>
                    <MDText variant="caption" tone="tertiary" numberOfLines={1}>
                      {product.manufacturer} · {product.productType}
                    </MDText>
                  </View>
                </Pressable>
              ))}
              <Pressable
                onPress={() => submit(query)}
                style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.md }}
              >
                <MDText variant="bodySm" weight="600" style={{ color: colors.brand.primary }}>
                  See all results for "{query}"
                </MDText>
              </Pressable>
            </View>
          ) : null}
        </View>

        {!committedQuery ? (
          <View style={{ gap: spacing.xl }}>
            {recentSearches.length > 0 ? (
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: spacing.sm,
                  }}
                >
                  <MDText variant="h4">Recent Searches</MDText>
                  <Pressable onPress={clearRecent}>
                    <MDText variant="caption" tone="tertiary">
                      Clear
                    </MDText>
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {recentSearches.map((term) => (
                    <Pressable key={term} onPress={() => submit(term)}>
                      <MDBadge label={term} tone="neutral" size="md" />
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            {productTypes && productTypes.length > 0 ? (
              <View>
                <MDText variant="h4" style={{ marginBottom: spacing.sm }}>
                  Popular Categories
                </MDText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {productTypes.slice(0, 8).map((type) => (
                    <Pressable key={type} onPress={() => submit(type)}>
                      <MDBadge label={type} tone="brand" size="md" />
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={{ alignItems: 'center', paddingVertical: spacing['3xl'] }}>
              <Ionicons name="search-outline" size={40} color={colors.text.tertiary} />
              <MDText variant="body" tone="secondary" align="center" style={{ marginTop: spacing.md }}>
                Search by part number, manufacturer, or keyword.
              </MDText>
            </View>
          </View>
        ) : (
          <View>
            {looksLikeEngineeringRequirement(committedQuery) ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  padding: spacing.md,
                  borderRadius: radius.md,
                  backgroundColor: colors.brand.primarySoft,
                  marginBottom: spacing.lg,
                  flexWrap: 'wrap',
                }}
              >
                <Ionicons name="sparkles" size={18} color={colors.brand.primary} />
                <MDText variant="bodySm" style={{ color: colors.brand.primary, flex: 1, minWidth: 200 }}>
                  This reads like an engineering requirement — AI Search can interpret it into structured
                  criteria instead of a plain keyword match.
                </MDText>
                <MDButton
                  label="Try AI Engineering Search"
                  size="sm"
                  onPress={() => router.push({ pathname: '/(buyer)/ai-search', params: { q: committedQuery } })}
                />
              </View>
            ) : null}
            <ProductCatalogView
              key={committedQuery}
              title={`Results for "${committedQuery}"`}
              initialFilters={{ search: committedQuery }}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}
