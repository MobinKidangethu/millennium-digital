import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDButton, MDText, useToast } from '@/design-system';
import { useAuthStore, useCheckoutStore, useCurrencyStore } from '@/state';
import { useCartLines } from '@/features/cart';
import { useCreateOrder } from '@/features/orders';
import { CheckoutStepper } from '@/components/CheckoutStepper';
import { formatDisplayPrice } from '@/utils';

export default function CheckoutReview() {
  const router = useRouter();
  const toast = useToast();
  const session = useAuthStore((s) => s.session);
  const { shippingAddress, billingAddress, shippingMethod, paymentMethod, reset } = useCheckoutStore();
  const { lines } = useCartLines();
  const createOrder = useCreateOrder();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const displayCurrency = useCurrencyStore((s) => s.currency);

  if (!shippingAddress || !shippingMethod || !paymentMethod) {
    return <Redirect href="/(buyer)/checkout/address" />;
  }

  const currency = lines[0]?.product.currency ?? 'INR';

  const handlePlaceOrder = () => {
    if (!acceptedTerms) {
      setError('Please accept the terms to place your order.');
      return;
    }
    if (lines.length === 0 || !session) return;

    createOrder.mutate(
      {
        userId: session.user.id,
        lines,
        shippingAddress,
        billingAddress: billingAddress ?? shippingAddress,
        shippingMethod,
        paymentMethod,
        currency,
      },
      {
        onSuccess: (order) => {
          reset();
          router.replace({ pathname: '/(buyer)/order-success/[orderId]', params: { orderId: order.id } });
        },
        onError: () => toast.show('Something went wrong placing your order. Please try again.', 'error'),
      },
    );
  };

  return (
    <View>
      <CheckoutStepper current="review" />
      <MDText variant="h2" style={{ marginBottom: spacing.lg }}>
        Review Your Order
      </MDText>

      <ReviewSection icon="location-outline" title="Shipping Address" onEdit={() => router.push('/(buyer)/checkout/address')}>
        <MDText variant="bodySm">{shippingAddress.fullName}</MDText>
        <MDText variant="bodySm" tone="secondary">
          {shippingAddress.line1}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
        </MDText>
      </ReviewSection>

      <ReviewSection icon="cube-outline" title="Shipping Method" onEdit={() => router.push('/(buyer)/checkout/shipping')}>
        <MDText variant="bodySm">
          {shippingMethod.label} · {shippingMethod.cost === 0 ? 'Free' : formatDisplayPrice(shippingMethod.cost, currency, displayCurrency)}
        </MDText>
      </ReviewSection>

      <ReviewSection icon="card-outline" title="Payment Method" onEdit={() => router.push('/(buyer)/checkout/payment')}>
        <MDText variant="bodySm">
          {paymentMethod.label}
          {paymentMethod.reference ? ` · ${paymentMethod.reference}` : ''}
        </MDText>
      </ReviewSection>

      <Pressable
        onPress={() => setAcceptedTerms((v) => !v)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}
      >
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: radius.sm - 2,
            borderWidth: 1.5,
            borderColor: acceptedTerms ? colors.brand.primary : colors.borderStrong,
            backgroundColor: acceptedTerms ? colors.brand.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {acceptedTerms ? <Ionicons name="checkmark" size={13} color={colors.gray[0]} /> : null}
        </View>
        <MDText variant="bodySm" style={{ flex: 1 }}>
          I agree to the Terms of Service and Privacy Policy.
        </MDText>
      </Pressable>

      {error ? (
        <MDText variant="bodySm" style={{ color: colors.status.error, marginBottom: spacing.md }}>
          {error}
        </MDText>
      ) : null}

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <MDButton label="Back" variant="outline" onPress={() => router.back()} disabled={createOrder.isPending} />
        <MDButton
          label="Place Order"
          size="lg"
          loading={createOrder.isPending}
          onPress={handlePlaceOrder}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

function ReviewSection({
  icon,
  title,
  onEdit,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <View style={{ marginBottom: spacing.lg, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Ionicons name={icon} size={16} color={colors.text.secondary} />
          <MDText variant="bodyMedium">{title}</MDText>
        </View>
        <MDText variant="caption" weight="600" style={{ color: colors.brand.primary }} onPress={onEdit}>
          Edit
        </MDText>
      </View>
      {children}
    </View>
  );
}
