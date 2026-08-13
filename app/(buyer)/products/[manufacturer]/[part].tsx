import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  layout,
  spacing,
  useResponsive,
  useToast,
  MDBadge,
  MDButton,
  MDEmptyState,
  MDIconButton,
  MDText,
} from '@/design-system';
import { useProductBySlug, useRelatedProducts } from '@/features/products';
import { rfqService } from '@/features/rfq';
import { useBomWorkflowStore, useCartFeedbackStore, useCartStore, useCompareStore, useRecentlyViewedStore, useWishlistStore } from '@/state';
import { MDProductImageGallery } from '@/components/MDProductImageGallery';
import { MDManufacturerLogo } from '@/components/MDManufacturerLogo';
import { MDRohsBadge } from '@/components/MDRohsBadge';
import { MDPrice } from '@/components/MDPrice';
import { MDStockStatus } from '@/components/MDStockStatus';
import { MDBreadcrumb } from '@/components/MDBreadcrumb';
import { MDQuantitySelector } from '@/components/MDQuantitySelector';
import { MDSpecTable } from '@/components/MDSpecTable';
import { MDProductCard } from '@/components/MDProductCard';
import { MDOnOrderModal } from '@/components/MDOnOrderModal';
import { computeBackorderSplit } from '@/utils';

const TAG_LABEL: Record<string, string> = {
  new: 'New',
  featured: 'Featured',
  'best-seller': 'Best Seller',
};

export default function ProductDetail() {
  const router = useRouter();
  const { manufacturer: manufacturerSlug, part: partSlug } = useLocalSearchParams<{
    manufacturer: string;
    part: string;
  }>();
  const { isDesktopUp } = useResponsive();
  const toast = useToast();

  const { data: product, isLoading } = useProductBySlug(manufacturerSlug, partSlug);
  const { data: related } = useRelatedProducts(product);
  const [quantity, setQuantity] = useState(1);

  const addToCart = useCartStore((s) => s.addItem);
  const notifyAdded = useCartFeedbackStore((s) => s.notifyAdded);
  const isWishlisted = useWishlistStore((s) => s.productIds.includes(product?.id ?? -1));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const compareIds = useCompareStore((s) => s.productIds);
  const addToCompare = useCompareStore((s) => s.add);
  const removeFromCompare = useCompareStore((s) => s.remove);
  const recordView = useRecentlyViewedStore((s) => s.recordView);
  const setRfq = useBomWorkflowStore((s) => s.setRfq);
  const setQuote = useBomWorkflowStore((s) => s.setQuote);
  const [requestingQuote, setRequestingQuote] = useState(false);
  const [onOrderModalOpen, setOnOrderModalOpen] = useState(false);

  useEffect(() => {
    if (product) recordView(product.id);
  }, [product, recordView]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <MDEmptyState
          icon={<Ionicons name="cube-outline" size={40} color={colors.text.tertiary} />}
          title="Product not found"
          description="This product may have been removed or the link is incorrect."
          actionLabel="Browse All Products"
          onAction={() => router.push('/(buyer)/products')}
        />
      </View>
    );
  }

  const isComparing = compareIds.includes(product.id);
  const backorderSplit = computeBackorderSplit(quantity, product.availability ?? 0);

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    notifyAdded(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product.id, quantity);
    router.push('/(buyer)/checkout/address');
  };

  const handleToggleCompare = () => {
    if (isComparing) {
      removeFromCompare(product.id);
      return;
    }
    if (!addToCompare(product.id)) {
      toast.show('You can compare up to 4 products at a time.', 'warning');
    }
  };

  const handleRequestQuote = async () => {
    setRequestingQuote(true);
    try {
      const rfq = await rfqService.createRfq([{ product, quantity }], 'manual');
      setRfq(rfq);
      setQuote(null);
      router.push({ pathname: '/(buyer)/rfq/[id]', params: { id: rfq.id } });
    } finally {
      setRequestingQuote(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <MDBreadcrumb
          items={[
            { label: 'Home', href: '/(buyer)' },
            { label: product.category, href: '/(buyer)/products' },
            { label: product.manufacturer, href: `/(buyer)/manufacturers/${product.manufacturerSlug}` },
            { label: product.manufacturerPartNumber },
          ]}
        />

        <View
          style={{
            flexDirection: isDesktopUp ? 'row' : 'column',
            gap: spacing['2xl'],
            marginTop: spacing.lg,
            marginBottom: spacing['3xl'],
          }}
        >
          <View style={isDesktopUp ? ({ width: 420, position: 'sticky', top: spacing.xl } as any) : { width: '100%' }}>
            <MDProductImageGallery
              imagePath={product.image}
              alt={product.title}
              badge={product.tags[0] ? TAG_LABEL[product.tags[0]] ?? product.tags[0] : undefined}
            />
          </View>

          <View style={{ flex: 1, gap: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Pressable
                onPress={() => router.push(`/(buyer)/manufacturers/${product.manufacturerSlug}`)}
                accessibilityLabel={`View all ${product.manufacturer} products`}
              >
                <MDManufacturerLogo manufacturer={product.manufacturer} width={130} height={30} />
              </Pressable>
              <MDIconButton
                accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                variant="outline"
                onPress={() => toggleWishlist(product.id)}
              >
                <Ionicons
                  name={isWishlisted ? 'heart' : 'heart-outline'}
                  size={18}
                  color={isWishlisted ? colors.brand.primary : colors.text.secondary}
                />
              </MDIconButton>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <MDText variant="h1">{product.manufacturerPartNumber}</MDText>
              <MDIconButton
                accessibilityLabel="Copy part number"
                variant="ghost"
                size={30}
                onPress={() => {
                  if (Platform.OS === 'web' && navigator?.clipboard) {
                    navigator.clipboard.writeText(product.manufacturerPartNumber);
                    toast.show('Part number copied', 'success');
                  }
                }}
              >
                <Ionicons name="copy-outline" size={15} color={colors.text.tertiary} />
              </MDIconButton>
            </View>
            {product.title !== product.manufacturerPartNumber ? (
              <MDText variant="bodyLg" tone="secondary">
                {product.title}
              </MDText>
            ) : null}
            <MDText variant="bodySm" tone="tertiary">
              MD Part # {product.mdPartNumber}
            </MDText>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm }}>
              <MDPrice amount={product.price} currency={product.currency} size="lg" />
              <MDStockStatus stockStatus={product.stockStatus} availability={product.availability} size="md" />
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm }}>
              {product.package ? <MDBadge label={product.package} tone="neutral" /> : null}
              {product.technology ? <MDBadge label={product.technology} tone="neutral" /> : null}
              {product.rohs ? <MDRohsBadge /> : null}
              {product.lifecycle ? <MDBadge label={product.lifecycle} tone="brand" /> : null}
            </View>

            <View
              style={{
                gap: spacing.sm,
                marginTop: spacing.md,
                paddingTop: spacing.lg,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: isDesktopUp ? 'row' : 'column',
                  alignItems: isDesktopUp ? 'center' : 'stretch',
                  gap: spacing.sm,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <MDText variant="caption" tone="tertiary">
                    Quantity
                  </MDText>
                  <MDQuantitySelector value={quantity} onChange={setQuantity} min={1} max={99999} />
                </View>
                <MDButton label="Add to Cart" onPress={handleAddToCart} style={{ flex: 1 }} iconRight={<Ionicons name="cart-outline" size={16} color={colors.text.onPrimary} />} />
                <MDIconButton
                  accessibilityLabel={isComparing ? 'Remove from compare' : 'Add to compare'}
                  variant="outline"
                  onPress={handleToggleCompare}
                >
                  <Ionicons
                    name="git-compare-outline"
                    size={18}
                    color={isComparing ? colors.brand.primary : colors.text.secondary}
                  />
                </MDIconButton>
                <MDButton label="Buy Now" variant="secondary" onPress={handleBuyNow} />
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Pressable
                  onPress={handleRequestQuote}
                  disabled={requestingQuote}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, opacity: requestingQuote ? 0.6 : 1 }}
                >
                  {requestingQuote ? (
                    <ActivityIndicator size="small" color={colors.brand.primary} />
                  ) : (
                    <Ionicons name="document-text-outline" size={14} color={colors.brand.primary} />
                  )}
                  <MDText variant="bodySm" weight="600" style={{ color: colors.brand.primary }}>
                    Request Quote (RFQ)
                  </MDText>
                </Pressable>
                {product.datasheet ? (
                  <>
                    <View style={{ width: 1, height: 14, backgroundColor: colors.border }} />
                    <Pressable
                      onPress={() => Linking.openURL(product.datasheet)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
                    >
                      <Ionicons name="document-attach-outline" size={14} color={colors.brand.primary} />
                      <MDText variant="bodySm" weight="600" style={{ color: colors.brand.primary }}>
                        View Datasheet
                      </MDText>
                    </Pressable>
                  </>
                ) : null}
              </View>

              {backorderSplit.hasBackorder ? (
                <Pressable
                  onPress={() => setOnOrderModalOpen(true)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: spacing.xs,
                    backgroundColor: colors.status.warningSoft,
                    borderRadius: 8,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                  }}
                >
                  <Ionicons name="warning-outline" size={14} color={colors.status.warningStrong} />
                  <MDText variant="bodySm" weight="600" style={{ color: colors.status.warningStrong }}>
                    {backorderSplit.shipNow.toLocaleString()} ship now · {backorderSplit.backordered.toLocaleString()} back-ordered
                  </MDText>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 'auto' }}>
                    <MDText variant="bodySm" weight="700" style={{ color: colors.status.warningStrong }}>
                      Details
                    </MDText>
                    <Ionicons name="information-circle-outline" size={14} color={colors.status.warningStrong} />
                  </View>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>

        <View>
          {product.description ? (
            <View style={{ marginBottom: spacing.xl, maxWidth: isDesktopUp ? 720 : undefined }}>
              <MDText variant="h4" style={{ marginBottom: spacing.sm }}>
                Description
              </MDText>
              <MDText variant="body" tone="secondary">
                {product.description}
              </MDText>
            </View>
          ) : null}

          <View style={{ flexDirection: isDesktopUp ? 'row' : 'column', gap: spacing.xl, alignItems: 'flex-start' }}>
            <MDSpecTable
              icon="document-text-outline"
              title="Product Information"
              style={{ flex: 1, width: '100%' }}
              rows={[
                { label: 'Manufacturer', value: product.manufacturer },
                { label: 'Manufacturer Part Number', value: product.manufacturerPartNumber },
                { label: 'MD Part Number', value: product.mdPartNumber },
                { label: 'Product Type', value: product.productType },
                { label: 'Technology', value: product.technology },
                { label: 'Package', value: product.package },
                { label: 'Mounting Style', value: product.mountingStyle },
              ]}
            />

            <MDSpecTable
              icon="shield-checkmark-outline"
              title="Compliance"
              style={{ flex: 1, width: '100%' }}
              rows={[
                { label: 'RoHS', value: product.rohsLabel || (product.rohs ? 'RoHS Compliant' : '') },
                { label: 'Lifecycle', value: product.lifecycle },
              ]}
            />

            <MDSpecTable
              icon="stats-chart-outline"
              title="Availability"
              style={{ flex: 1, width: '100%' }}
              rows={[
                { label: 'Stock Status', value: product.stockStatus },
                { label: 'Available Quantity', value: product.availability?.toLocaleString() ?? '' },
                { label: 'Stock Type', value: product.stockType },
              ]}
            />
          </View>
        </View>

        {related && related.length > 0 ? (
          <View style={{ marginTop: spacing['3xl'] }}>
            <MDText variant="h3" style={{ marginBottom: spacing.lg }}>
              Related Products
            </MDText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.lg, paddingRight: spacing.xl }}
            >
              {related.map((item) => (
                <View key={item.id} style={{ width: isDesktopUp ? 220 : 180 }}>
                  <MDProductCard product={item} />
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>

      <MDOnOrderModal
        visible={onOrderModalOpen}
        onClose={() => setOnOrderModalOpen(false)}
        product={product}
        shipNow={backorderSplit.shipNow}
        backordered={backorderSplit.backordered}
      />
    </ScrollView>
  );
}
