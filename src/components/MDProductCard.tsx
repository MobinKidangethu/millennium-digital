import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  radius,
  shadow,
  spacing,
  webTransition,
  MDBadge,
  MDButton,
  MDIconButton,
  MDText,
} from '@/design-system';
import type { Product } from '@/types';
import { useCartStore, useCartFeedbackStore, useCompareStore, useWishlistStore } from '@/state';
import { useToast } from '@/design-system';
import { MDProductImage } from './MDProductImage';
import { MDManufacturerLogo } from './MDManufacturerLogo';
import { MDPrice } from './MDPrice';
import { MDStockStatus } from './MDStockStatus';
import { MDQuantitySelector } from './MDQuantitySelector';

interface MDProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
}

const TAG_LABEL: Record<string, string> = {
  new: 'New',
  featured: 'Featured',
  'best-seller': 'Best Seller',
};

/** Green checkmark pill for RoHS compliance — styled to match the product card's other pills. */
function RohsPill() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        alignSelf: 'flex-start',
        backgroundColor: colors.status.successSoft,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
      }}
    >
      <Ionicons name="checkmark-circle" size={13} color={colors.status.successStrong} />
      <MDText variant="caption" weight="700" style={{ color: colors.status.successStrong }}>
        RoHS
      </MDText>
    </View>
  );
}

export function MDProductCard({ product, layout = 'grid' }: MDProductCardProps) {
  const router = useRouter();
  const toast = useToast();
  const [hovered, setHovered] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((s) => s.addItem);
  const notifyAdded = useCartFeedbackStore((s) => s.notifyAdded);
  const isWishlisted = useWishlistStore((s) => s.productIds.includes(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const compareIds = useCompareStore((s) => s.productIds);
  const addToCompare = useCompareStore((s) => s.add);
  const removeFromCompare = useCompareStore((s) => s.remove);
  const isComparing = compareIds.includes(product.id);

  const primaryTag = product.tags[0];
  const subtitle = product.title !== product.manufacturerPartNumber ? product.title : product.productType;

  const goToDetail = () => {
    router.push({
      pathname: '/(buyer)/products/[manufacturer]/[part]',
      params: { manufacturer: product.manufacturerSlug, part: product.partSlug },
    });
  };

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    notifyAdded(product, quantity);
    setQuantity(1);
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

  const wishlistButton = (
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
  );

  const quantityStepper = (
    <Pressable
      // Wrap the stepper so taps/typing inside it (including the text
      // input, whose click would otherwise bubble to the card's own
      // onPress like any nested pressable — see MDButton/MDIconButton)
      // never trigger card navigation.
      onPress={(e) => e.stopPropagation?.()}
    >
      <MDQuantitySelector value={quantity} onChange={setQuantity} size="sm" />
    </Pressable>
  );

  const compareButton = (
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
  );

  if (isList) {
    return (
      <Pressable
        onPress={goToDetail}
        // See the grid layout below for why this isn't accessibilityRole="button".
        accessibilityRole="link"
        accessibilityLabel={`${product.manufacturer} ${product.manufacturerPartNumber}`}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={({ pressed }) => [
          {
            position: 'relative',
            flexDirection: 'row',
            width: '100%',
            backgroundColor: colors.surfaceRaised,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: hovered ? colors.interaction.hoverBorder : colors.border,
            overflow: 'hidden',
            transform: [{ translateY: hovered && !pressed ? -2 : 0 }, { scale: pressed ? 0.995 : 1 }],
          },
          webTransition,
          hovered ? shadow.hover : shadow.sm,
        ]}
      >
        <View style={{ width: 152, height: 152, flexShrink: 0, position: 'relative' }}>
          <MDProductImage imagePath={product.image} alt={product.title} style={{ width: '100%', height: '100%' }} />

          {primaryTag ? (
            <View style={{ position: 'absolute', top: spacing.sm, left: spacing.sm }}>
              <MDBadge label={TAG_LABEL[primaryTag] ?? primaryTag} tone="brand" />
            </View>
          ) : null}

          <View
            style={{
              position: 'absolute',
              left: spacing.sm,
              bottom: spacing.sm,
              backgroundColor: colors.surfaceRaised,
              borderRadius: radius.sm,
              paddingHorizontal: spacing.xs,
              paddingVertical: 2,
            }}
          >
            <MDManufacturerLogo manufacturer={product.manufacturer} width={64} height={18} />
          </View>
        </View>

        <View style={{ flex: 1, minWidth: 0, padding: spacing.md, paddingRight: 48, gap: 6, justifyContent: 'center' }}>
          <MDText variant="bodyMedium" weight="700" numberOfLines={1}>
            {product.manufacturerPartNumber}
          </MDText>
          <MDText variant="caption" tone="secondary" numberOfLines={1}>
            {subtitle}
          </MDText>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {product.package ? <MDBadge label={product.package} tone="neutral" /> : null}
            {product.rohs ? <RohsPill /> : null}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: 2 }}>
            <MDPrice amount={product.price} currency={product.currency} size="sm" />
            <MDStockStatus stockStatus={product.stockStatus} />
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: spacing.sm,
              marginTop: spacing.sm,
            }}
          >
            {quantityStepper}
            <MDButton label="Add to Cart" size="sm" onPress={handleAddToCart} style={{ flex: 1, minWidth: 140 }} />
            {compareButton}
          </View>
        </View>

        {wishlistButton}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={goToDetail}
      // Not accessibilityRole="button": the card wraps other real buttons
      // (wishlist, compare, add-to-cart), and HTML forbids a <button>
      // inside a <button> — react-native-web renders "button" role as an
      // actual <button> tag, so nesting would produce invalid/broken HTML.
      accessibilityRole="link"
      accessibilityLabel={`${product.manufacturer} ${product.manufacturerPartNumber}`}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        {
          position: 'relative',
          flexDirection: 'column',
          backgroundColor: colors.surfaceRaised,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: hovered ? colors.interaction.hoverBorder : colors.border,
          overflow: 'hidden',
          flex: 1,
          padding: spacing.md,
          gap: spacing.sm,
          transform: [{ translateY: hovered && !pressed ? -3 : 0 }, { scale: pressed ? 0.99 : 1 }],
        },
        webTransition,
        hovered ? shadow.hover : shadow.sm,
      ]}
    >
      <View
        style={{
          width: '100%',
          aspectRatio: 1,
          borderRadius: radius.lg,
          overflow: 'hidden',
          backgroundColor: colors.surface,
          position: 'relative',
        }}
      >
        <MDProductImage imagePath={product.image} alt={product.title} style={{ width: '100%', height: '100%' }} />

        {primaryTag ? (
          <View style={{ position: 'absolute', top: spacing.sm, left: spacing.sm }}>
            <MDBadge label={TAG_LABEL[primaryTag] ?? primaryTag} tone="brand" />
          </View>
        ) : null}

        <View
          style={{
            position: 'absolute',
            left: spacing.sm,
            bottom: spacing.sm,
            backgroundColor: colors.surfaceRaised,
            borderRadius: radius.sm,
            paddingHorizontal: spacing.xs,
            paddingVertical: 2,
          }}
        >
          <MDManufacturerLogo manufacturer={product.manufacturer} width={72} height={20} />
        </View>
      </View>

      <View style={{ gap: 6, paddingRight: 4 }}>
        <MDText variant="h3" weight="800" numberOfLines={1}>
          {product.manufacturerPartNumber}
        </MDText>
        <MDText variant="body" tone="secondary" numberOfLines={1}>
          {subtitle}
        </MDText>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: 2 }}>
          {product.package ? <MDBadge label={product.package} tone="neutral" /> : null}
          {product.rohs ? <RohsPill /> : null}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: spacing.xs }}>
          <MDPrice amount={product.price} currency={product.currency} size="lg" />
          <MDText variant="caption" tone="tertiary">
            / piece
          </MDText>
        </View>
        <MDStockStatus stockStatus={product.stockStatus} size="md" />
      </View>

      <View style={{ marginTop: spacing.xs }}>{quantityStepper}</View>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <MDButton
          label="Add to Cart"
          size="md"
          onPress={handleAddToCart}
          style={{ flex: 1 }}
          iconRight={<Ionicons name="cart-outline" size={16} color={colors.text.onPrimary} />}
        />
        {compareButton}
      </View>

      {wishlistButton}
    </Pressable>
  );
}
