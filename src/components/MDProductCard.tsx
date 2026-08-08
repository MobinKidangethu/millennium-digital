import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, MDBadge, MDButton, MDIconButton, MDText } from '@/design-system';
import type { Product } from '@/types';
import { useCartStore, useCompareStore, useWishlistStore } from '@/state';
import { useToast } from '@/design-system';
import { MDProductImage } from './MDProductImage';
import { MDManufacturerLogo } from './MDManufacturerLogo';
import { MDPrice } from './MDPrice';
import { MDStockStatus } from './MDStockStatus';

interface MDProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
}

const TAG_LABEL: Record<string, string> = {
  new: 'New',
  featured: 'Featured',
  'best-seller': 'Best Seller',
};

export function MDProductCard({ product, layout = 'grid' }: MDProductCardProps) {
  const router = useRouter();
  const toast = useToast();
  const addToCart = useCartStore((s) => s.addItem);
  const isWishlisted = useWishlistStore((s) => s.productIds.includes(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const compareIds = useCompareStore((s) => s.productIds);
  const addToCompare = useCompareStore((s) => s.add);
  const removeFromCompare = useCompareStore((s) => s.remove);
  const isComparing = compareIds.includes(product.id);

  const primaryTag = product.tags[0];

  const goToDetail = () => {
    router.push({
      pathname: '/(buyer)/products/[manufacturer]/[part]',
      params: { manufacturer: product.manufacturerSlug, part: product.partSlug },
    });
  };

  const handleAddToCart = () => {
    addToCart(product.id, 1);
    toast.show(`Added ${product.manufacturerPartNumber} to cart`, 'success');
  };

  const handleToggleCompare = () => {
    if (isComparing) {
      removeFromCompare(product.id);
      return;
    }
    const added = addToCompare(product.id);
    if (!added) {
      toast.show('You can compare up to 4 products at a time.', 'warning');
    }
  };

  const isList = layout === 'list';

  return (
    <Pressable
      onPress={goToDetail}
      // Not accessibilityRole="button": the card wraps other real buttons
      // (wishlist, compare, add-to-cart), and HTML forbids a <button>
      // inside a <button> — react-native-web renders "button" role as an
      // actual <button> tag, so nesting would produce invalid/broken HTML.
      accessibilityRole="link"
      accessibilityLabel={`${product.manufacturer} ${product.manufacturerPartNumber}`}
      style={[
        {
          flexDirection: isList ? 'row' : 'column',
          backgroundColor: colors.surfaceRaised,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
          flex: 1,
        },
        shadow.sm,
      ]}
    >
      <View
        style={{
          width: isList ? 120 : '100%',
          height: isList ? 120 : 148,
          position: 'relative',
        }}
      >
        <MDProductImage imagePath={product.image} alt={product.title} style={{ width: '100%', height: '100%' }} />

        {primaryTag ? (
          <View style={{ position: 'absolute', top: spacing.sm, left: spacing.sm }}>
            <MDBadge label={TAG_LABEL[primaryTag] ?? primaryTag} tone="brand" />
          </View>
        ) : null}

        <MDIconButton
          accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onPress={() => toggleWishlist(product.id)}
          variant="filled"
          size={32}
          style={{ position: 'absolute', top: spacing.sm, right: spacing.sm, backgroundColor: colors.surfaceRaised }}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={16}
            color={isWishlisted ? colors.brand.primary : colors.text.secondary}
          />
        </MDIconButton>
      </View>

      <View style={{ flex: 1, padding: spacing.md, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <MDManufacturerLogo manufacturer={product.manufacturer} width={60} height={14} />
        </View>

        <MDText variant="bodyMedium" numberOfLines={1}>
          {product.manufacturerPartNumber}
        </MDText>
        <MDText variant="caption" tone="secondary" numberOfLines={1}>
          {product.title !== product.manufacturerPartNumber ? product.title : product.productType}
        </MDText>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: 2 }}>
          {product.package ? <MDBadge label={product.package} tone="neutral" /> : null}
          {product.rohs ? <MDBadge label="RoHS" tone="success" /> : null}
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: spacing.xs,
          }}
        >
          <MDPrice amount={product.price} currency={product.currency} size="sm" />
        </View>
        <MDStockStatus stockStatus={product.stockStatus} />

        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
          <MDButton label="Add to Cart" size="sm" onPress={handleAddToCart} style={{ flex: 1 }} />
          <MDIconButton
            accessibilityLabel={isComparing ? 'Remove from compare' : 'Add to compare'}
            variant="outline"
            onPress={handleToggleCompare}
          >
            <Ionicons
              name="git-compare-outline"
              size={16}
              color={isComparing ? colors.brand.primary : colors.text.secondary}
            />
          </MDIconButton>
        </View>
      </View>
    </Pressable>
  );
}
