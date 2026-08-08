import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
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
import { useCartStore, useCompareStore, useRecentlyViewedStore, useWishlistStore } from '@/state';
import { MDProductImage } from '@/components/MDProductImage';
import { MDManufacturerLogo } from '@/components/MDManufacturerLogo';
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
          <View style={{ width: isDesktopUp ? 420 : '100%' }}>
            <View style={{ width: '100%', aspectRatio: 1, position: 'relative' }}>
              <MDProductImage imagePath={product.image} alt={product.title} style={{ width: '100%', height: '100%' }} />
              {product.tags[0] ? (
                <View style={{ position: 'absolute', top: spacing.md, left: spacing.md }}>
                  <MDBadge label={TAG_LABEL[product.tags[0]] ?? product.tags[0]} tone="brand" size="md" />
                </View>
              ) : null}
            </View>
          </View>

          <View style={{ flex: 1, gap: spacing.md }}>
            <MDManufacturerLogo manufacturer={product.manufacturer} width={130} height={30} />
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

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {product.package ? <MDBadge label={product.package} tone="neutral" /> : null}
              {product.technology ? <MDBadge label={product.technology} tone="neutral" /> : null}
              {product.rohs ? <MDBadge label={product.rohsLabel || 'RoHS Compliant'} tone="success" /> : null}
              <MDBadge label={product.lifecycle} tone="info" />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.lg,
                marginTop: spacing.md,
                paddingTop: spacing.lg,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <View>
                <MDText variant="caption" tone="tertiary" style={{ marginBottom: spacing.xs }}>
                  Quantity
                </MDText>
                <MDQuantitySelector value={quantity} onChange={setQuantity} min={1} max={product.availability || undefined} />
              </View>

              <View style={{ flex: 1, gap: spacing.sm }}>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <MDButton label="Add to Cart" onPress={handleAddToCart} style={{ flex: 1 }} />
                  <MDButton label="Buy Now" variant="secondary" onPress={handleBuyNow} style={{ flex: 1 }} />
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
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
                  {product.datasheet ? (
                    <MDDatasheetButton url={product.datasheet} variant="outline" fullWidth />
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: isDesktopUp ? 'row' : 'column', gap: spacing['2xl'] }}>
          <View style={{ flex: 2 }}>
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

          <View style={{ flex: 1 }}>
            <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: spacing.lg }}>
              <MDText variant="h4" style={{ marginBottom: spacing.sm }}>
                Manufacturer
              </MDText>
              <MDManufacturerLogo manufacturer={product.manufacturer} width={140} height={32} />
              <MDText variant="bodySm" tone="secondary" style={{ marginTop: spacing.sm }}>
                Genuine {product.manufacturer} components, sourced through verified distribution
                channels.
              </MDText>
              <MDButton
                label={`View All ${product.manufacturer} Products`}
                variant="outline"
                size="sm"
                style={{ marginTop: spacing.md }}
                onPress={() => router.push(`/(buyer)/manufacturers/${product.manufacturerSlug}`)}
              />
            </View>
          </View>
        </View>

        {related && related.length > 0 ? (
          <View style={{ marginTop: spacing['3xl'] }}>
            <MDText variant="h3" style={{ marginBottom: spacing.lg }}>
              Related Products
            </MDText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
              {related.map((item) => (
                <View key={item.id} style={{ width: isDesktopUp ? '23%' : '47%' }}>
                  <MDProductCard product={item} />
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
