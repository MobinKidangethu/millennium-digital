import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
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
import { useBomWorkflowStore, useCartStore, useCompareStore, useRecentlyViewedStore, useWishlistStore } from '@/state';
import { MDProductImageGallery } from '@/components/MDProductImageGallery';
import { MDManufacturerLogo } from '@/components/MDManufacturerLogo';
import { MDRohsBadge } from '@/components/MDRohsBadge';
import { MDPrice } from '@/components/MDPrice';
import { MDStockStatus } from '@/components/MDStockStatus';
import { MDDatasheetButton } from '@/components/MDDatasheetButton';
import { MDBreadcrumb } from '@/components/MDBreadcrumb';
import { MDQuantitySelector } from '@/components/MDQuantitySelector';
import { MDSpecTable } from '@/components/MDSpecTable';
import { MDProductCard } from '@/components/MDProductCard';

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
  const isWishlisted = useWishlistStore((s) => s.productIds.includes(product?.id ?? -1));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const compareIds = useCompareStore((s) => s.productIds);
  const addToCompare = useCompareStore((s) => s.add);
  const removeFromCompare = useCompareStore((s) => s.remove);
  const recordView = useRecentlyViewedStore((s) => s.recordView);
  const setRfq = useBomWorkflowStore((s) => s.setRfq);
  const setQuote = useBomWorkflowStore((s) => s.setQuote);
  const [requestingQuote, setRequestingQuote] = useState(false);

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

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    toast.show(`Added ${quantity} × ${product.manufacturerPartNumber} to cart`, 'success');
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
            <Pressable
              onPress={() => router.push(`/(buyer)/manufacturers/${product.manufacturerSlug}`)}
              accessibilityLabel={`View all ${product.manufacturer} products`}
              style={{ alignSelf: 'flex-start' }}
            >
              <MDManufacturerLogo manufacturer={product.manufacturer} width={130} height={30} />
            </Pressable>
            <MDText variant="h1">{product.manufacturerPartNumber}</MDText>
            {product.title !== product.manufacturerPartNumber ? (
              <MDText variant="bodyLg" tone="secondary">
                {product.title}
              </MDText>
            ) : null}
            <MDText variant="bodySm" tone="tertiary">
              Mouser Part # {product.mouserPartNumber}
            </MDText>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm }}>
              <MDPrice amount={product.price} currency={product.currency} size="lg" />
              <MDStockStatus stockStatus={product.stockStatus} availability={product.availability} size="md" />
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm }}>
              {product.package ? <MDBadge label={product.package} tone="neutral" /> : null}
              {product.technology ? <MDBadge label={product.technology} tone="neutral" /> : null}
              {product.rohs ? <MDRohsBadge /> : null}
              <MDBadge label={product.lifecycle} tone="info" />
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
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <MDText variant="caption" tone="tertiary">
                    Quantity
                  </MDText>
                  <MDQuantitySelector value={quantity} onChange={setQuantity} min={1} max={product.availability || undefined} />
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
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
                </View>
              </View>

              <MDButton label="Add to Cart" onPress={handleAddToCart} fullWidth />
              <MDButton label="Buy Now" variant="secondary" onPress={handleBuyNow} fullWidth />
              <MDButton
                label="Request Quote (RFQ)"
                variant="outline"
                fullWidth
                loading={requestingQuote}
                iconLeft={<Ionicons name="document-text-outline" size={16} color={colors.brand.primary} />}
                onPress={handleRequestQuote}
              />
              {product.datasheet ? <MDDatasheetButton url={product.datasheet} variant="outline" fullWidth /> : null}
            </View>
          </View>
        </View>

        <View style={{ maxWidth: isDesktopUp ? 720 : undefined }}>
          {product.description ? (
            <View style={{ marginBottom: spacing.xl }}>
              <MDText variant="h4" style={{ marginBottom: spacing.sm }}>
                Description
              </MDText>
              <MDText variant="body" tone="secondary">
                {product.description}
              </MDText>
            </View>
          ) : null}

          <MDSpecTable
            title="Product Information"
            rows={[
              { label: 'Manufacturer', value: product.manufacturer },
              { label: 'Manufacturer Part Number', value: product.manufacturerPartNumber },
              { label: 'Mouser Part Number', value: product.mouserPartNumber },
              { label: 'Product Type', value: product.productType },
              { label: 'Technology', value: product.technology },
              { label: 'Package', value: product.package },
              { label: 'Mounting Style', value: product.mountingStyle },
            ]}
          />

          <MDSpecTable
            title="Compliance"
            rows={[
              { label: 'RoHS', value: product.rohsLabel || (product.rohs ? 'RoHS Compliant' : '') },
              { label: 'Lifecycle', value: product.lifecycle },
            ]}
          />

          <MDSpecTable
            title="Availability"
            rows={[
              { label: 'Stock Status', value: product.stockStatus },
              { label: 'Available Quantity', value: product.availability?.toLocaleString() ?? '' },
              { label: 'Stock Type', value: product.stockType },
            ]}
          />
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
    </ScrollView>
  );
}
