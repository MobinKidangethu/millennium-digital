import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  layout,
  radius,
  spacing,
  useResponsive,
  MDBadge,
  MDButton,
  MDCard,
  MDEmptyState,
  MDInput,
  MDText,
} from '@/design-system';
import { aiService } from '@/features/ai';
import { useCreateRfq } from '@/features/rfq';
import { orderService } from '@/features/orders';
import { useAuthStore, useBomWorkflowStore, useCartFeedbackStore, useCartStore, useCompareStore, useCurrencyStore } from '@/state';
import { ProtoBadge } from '@/components/ProtoBadge';
import { MDProductImage } from '@/components/MDProductImage';
import { MDManufacturerLogo } from '@/components/MDManufacturerLogo';
import { MDPrice } from '@/components/MDPrice';
import { MDStockStatus } from '@/components/MDStockStatus';
import { formatDisplayPrice } from '@/utils';
import type { AiSearchResult, Product } from '@/types';

const EXAMPLE_QUERIES = [
  'Find a MOSFET suitable for automotive applications with low RDS(on), SMD package and availability above 500',
  'RoHS compliant SiC Schottky diode from Vishay',
  'Zener diode with availability above 5000 units',
  'Infineon SMD MOSFET under 400 rupees',
];

function ResultRow({ product, onRequestQuote, requestingId }: { product: Product; onRequestQuote: (p: Product) => void; requestingId: number | null }) {
  const { isDesktopUp } = useResponsive();
  const router = useRouter();
  const addToCart = useCartStore((s) => s.addItem);
  const notifyAdded = useCartFeedbackStore((s) => s.notifyAdded);
  const compareIds = useCompareStore((s) => s.productIds);
  const addToCompare = useCompareStore((s) => s.add);
  const removeFromCompare = useCompareStore((s) => s.remove);
  const isComparing = compareIds.includes(product.id);

  return (
    <MDCard padding="md" style={{ flexDirection: isDesktopUp ? 'row' : 'column', gap: spacing.md, alignItems: isDesktopUp ? 'center' : 'stretch' }}>
      <Pressable
        onPress={() =>
          router.push({ pathname: '/(buyer)/products/[manufacturer]/[part]', params: { manufacturer: product.manufacturerSlug, part: product.partSlug } })
        }
        style={{ flexDirection: 'row', gap: spacing.md, flex: isDesktopUp ? 1 : undefined, alignItems: 'center' }}
      >
        <View style={{ width: 64, height: 64, borderRadius: radius.md, overflow: 'hidden' }}>
          <MDProductImage imagePath={product.image} alt={product.title} style={{ width: '100%', height: '100%' }} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <MDManufacturerLogo manufacturer={product.manufacturer} width={72} height={16} />
          <MDText variant="bodyMedium" numberOfLines={1}>
            {product.manufacturerPartNumber}
          </MDText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            <MDBadge label={product.productType} tone="neutral" />
            {product.technology ? <MDBadge label={product.technology} tone="neutral" /> : null}
            <MDBadge label={product.mountingStyle} tone="neutral" />
            {product.rohs ? <MDBadge label="RoHS" tone="success" /> : null}
          </View>
          <MDStockStatus stockStatus={product.stockStatus} availability={product.availability} />
        </View>
      </Pressable>

      <View style={{ alignItems: isDesktopUp ? 'flex-end' : 'flex-start', gap: spacing.sm }}>
        <MDPrice amount={product.price} currency={product.currency} size="md" />
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          <MDButton
            label="Add to Cart"
            size="sm"
            variant="outline"
            onPress={() => {
              addToCart(product.id, 1);
              notifyAdded(product, 1);
            }}
          />
          <MDButton
            label={isComparing ? 'In Compare' : 'Compare'}
            size="sm"
            variant="ghost"
            onPress={() => (isComparing ? removeFromCompare(product.id) : addToCompare(product.id))}
          />
          <MDButton
            label="Request Quote"
            size="sm"
            loading={requestingId === product.id}
            onPress={() => onRequestQuote(product)}
          />
        </View>
      </View>
    </MDCard>
  );
}

export default function AiEngineeringSearch() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(q ?? '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiSearchResult | null>(null);
  const [orderLookupError, setOrderLookupError] = useState<string | null>(null);
  const [requestingId, setRequestingId] = useState<number | null>(null);
  const setRfq = useBomWorkflowStore((s) => s.setRfq);
  const setQuote = useBomWorkflowStore((s) => s.setQuote);
  const createRfq = useCreateRfq();
  const displayCurrency = useCurrencyStore((s) => s.currency);
  const session = useAuthStore((s) => s.session);

  const runSearch = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setOrderLookupError(null);
    try {
      // Order-number lookup takes priority over product search — typing an
      // order number should jump straight to that order's screen.
      const orderNumber = aiService.extractOrderNumber(text);
      if (orderNumber) {
        if (!session?.user.id) {
          setOrderLookupError(`Sign in to look up order ${orderNumber}.`);
          return;
        }
        const order = await orderService.getOrderByNumber(orderNumber, session.user.id);
        if (order) {
          router.push({ pathname: '/(buyer)/account/orders/[id]', params: { id: order.id } });
          return;
        }
        setOrderLookupError(`Couldn't find an order matching ${orderNumber} on your account.`);
        return;
      }

      const res = await aiService.runAiSearch(text);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (q) runSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const handleRequestQuote = async (product: Product) => {
    setRequestingId(product.id);
    try {
      const rfq = await createRfq.mutateAsync({ lines: [{ product, quantity: 1 }], source: 'ai-search' });
      setRfq(rfq);
      setQuote(null);
      router.push({ pathname: '/(buyer)/rfq/[id]', params: { id: rfq.id } });
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
          <MDText variant="h1">AI Engineering Search</MDText>
          <ProtoBadge />
        </View>
        <MDText variant="body" tone="secondary" style={{ marginBottom: spacing.xl, maxWidth: 720 }}>
          Describe what you're designing — the assistant maps it to real catalog criteria and explains its match.
        </MDText>

        <MDCard padding="lg" style={{ marginBottom: spacing.xl }}>
          <MDInput
            value={query}
            onChangeText={setQuery}
            placeholder="e.g. Find a 100V MOSFET for automotive use, low RDS(on), SMD package, availability above 500"
            multiline
            style={{ marginBottom: spacing.md }}
            onSubmitEditing={() => runSearch(query)}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
            {EXAMPLE_QUERIES.map((q) => (
              <Pressable
                key={q}
                onPress={() => {
                  setQuery(q);
                  runSearch(q);
                }}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.pill,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                }}
              >
                <MDText variant="caption" tone="secondary" numberOfLines={1}>
                  {q}
                </MDText>
              </Pressable>
            ))}
          </View>
          <MDButton label="Ask AI" onPress={() => runSearch(query)} loading={loading} iconLeft={<Ionicons name="sparkles-outline" size={16} color={colors.gray[0]} />} />
          <MDText variant="caption" tone="tertiary" style={{ marginTop: spacing.sm }}>
            Tip: paste an order number (e.g. MD-20260813-4821) to jump straight to that order's status.
          </MDText>
        </MDCard>

        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing['3xl'] }}>
            <ActivityIndicator color={colors.brand.primary} />
            <MDText variant="bodySm" tone="tertiary" style={{ marginTop: spacing.md }}>
              Interpreting requirement and searching the catalog…
            </MDText>
          </View>
        ) : null}

        {!loading && orderLookupError ? (
          <MDEmptyState
            icon={<Ionicons name="receipt-outline" size={40} color={colors.text.tertiary} />}
            title="Order not found"
            description={orderLookupError}
            actionLabel="View Order History"
            onAction={() => router.push('/(buyer)/account/orders')}
          />
        ) : null}

        {!loading && !orderLookupError && result ? (
          <View>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing.lg,
                marginBottom: spacing.xl,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
                <Ionicons name="sparkles" size={16} color={colors.brand.primary} />
                <MDText variant="bodyMedium">How this was interpreted</MDText>
              </View>
              <MDText variant="bodySm" tone="secondary" style={{ marginBottom: spacing.sm }}>
                {result.explanation}
              </MDText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                {result.criteria.productType ? <MDBadge label={`Type: ${result.criteria.productType}`} tone="brand" /> : null}
                {result.criteria.technology ? <MDBadge label={`Tech: ${result.criteria.technology}`} tone="brand" /> : null}
                {result.criteria.mountingStyle ? <MDBadge label={`Mount: ${result.criteria.mountingStyle}`} tone="brand" /> : null}
                {result.criteria.manufacturer ? <MDBadge label={`Mfr: ${result.criteria.manufacturer}`} tone="brand" /> : null}
                {result.criteria.rohsOnly ? <MDBadge label="RoHS" tone="success" /> : null}
                {result.criteria.minAvailability != null ? <MDBadge label={`Availability > ${result.criteria.minAvailability}`} tone="brand" /> : null}
                {result.criteria.maxPrice != null ? <MDBadge label={`Price < ${formatDisplayPrice(result.criteria.maxPrice, 'INR', displayCurrency)}`} tone="brand" /> : null}
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
              <MDText variant="h4">
                {result.totalMatches} Recommended Component{result.totalMatches === 1 ? '' : 's'}
                {result.totalMatches > result.matches.length ? ` (showing top ${result.matches.length})` : ''}
              </MDText>
              {result.matches.length > 1 ? (
                <MDButton label="Compare Results" variant="outline" size="sm" onPress={() => router.push('/(buyer)/compare')} />
              ) : null}
            </View>

            {result.matches.length === 0 ? (
              <MDEmptyState
                icon={<Ionicons name="search-outline" size={40} color={colors.text.tertiary} />}
                title="No catalog matches"
                description="Try a broader requirement, or submit a Design Request so our engineering team can source it."
                actionLabel="Start a Design Request"
                onAction={() => router.push('/(buyer)/design-request')}
              />
            ) : (
              <View style={{ gap: spacing.md }}>
                {result.matches.map((product) => (
                  <ResultRow key={product.id} product={product} onRequestQuote={handleRequestQuote} requestingId={requestingId} />
                ))}
              </View>
            )}
          </View>
        ) : null}

        {!loading && !result && !orderLookupError ? (
          <MDEmptyState
            icon={<Ionicons name="sparkles-outline" size={40} color={colors.text.tertiary} />}
            title="Describe your engineering requirement"
            description="Try one of the example prompts above, or type your own — the assistant works from real catalog attributes only."
          />
        ) : null}
      </View>
    </ScrollView>
  );
}
