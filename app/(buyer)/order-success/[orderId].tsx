import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDButton, MDEmptyState, MDText, useToast } from '@/design-system';
import { useOrder } from '@/features/orders';
import { formatDisplayPrice } from '@/utils';
import { useCurrencyStore } from '@/state';

export default function OrderSuccess() {
  const router = useRouter();
  const toast = useToast();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { data: order, isLoading } = useOrder(orderId);
  const displayCurrency = useCurrencyStore((s) => s.currency);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <MDEmptyState title="Order not found" actionLabel="Go to Home" onAction={() => router.replace('/(buyer)')} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: 640, width: '100%', alignSelf: 'center', padding: spacing.xl, alignItems: 'center' }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: radius.pill,
            backgroundColor: colors.status.successSoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: spacing.xl,
            marginBottom: spacing.lg,
          }}
        >
          <Ionicons name="checkmark" size={32} color={colors.status.successStrong} />
        </View>

        <MDText variant="h1" align="center">
          Order Placed Successfully
        </MDText>
        <MDText variant="body" tone="secondary" align="center" style={{ marginTop: spacing.xs, marginBottom: spacing.xl }}>
          Order #{order.orderNumber}
        </MDText>

        <View
          style={{
            width: '100%',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.lg,
            gap: spacing.md,
            marginBottom: spacing.xl,
          }}
        >
          {order.items.map((item) => (
            <View key={item.productId} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <MDText variant="bodySm">
                {item.manufacturerPartNumber} × {item.quantity}
              </MDText>
              <MDText variant="bodySm" weight="600">
                {formatDisplayPrice(item.price * item.quantity, order.currency, displayCurrency)}
              </MDText>
            </View>
          ))}
          <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, flexDirection: 'row', justifyContent: 'space-between' }}>
            <MDText variant="bodyMedium">Total</MDText>
            <MDText variant="bodyMedium" weight="700">
              {formatDisplayPrice(order.total, order.currency, displayCurrency)}
            </MDText>
          </View>
        </View>

        <View style={{ width: '100%', flexDirection: 'row', gap: spacing.xl, marginBottom: spacing.xl }}>
          <View style={{ flex: 1 }}>
            <MDText variant="bodySm" tone="tertiary">
              Shipping To
            </MDText>
            <MDText variant="bodySm" style={{ marginTop: 2 }}>
              {order.shippingAddress.fullName}
            </MDText>
            <MDText variant="bodySm" tone="secondary">
              {order.shippingAddress.city}, {order.shippingAddress.state}
            </MDText>
          </View>
          <View style={{ flex: 1 }}>
            <MDText variant="bodySm" tone="tertiary">
              Estimated Delivery
            </MDText>
            <MDText variant="bodySm" style={{ marginTop: 2 }}>
              {new Date(order.estimatedDelivery).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </MDText>
            <MDText variant="bodySm" tone="secondary">
              via {order.shippingMethod.label}
            </MDText>
          </View>
        </View>

        <View style={{ width: '100%', gap: spacing.sm }}>
          <MDButton
            label="Track Order"
            fullWidth
            onPress={() => router.push({ pathname: '/(buyer)/account/orders/[id]', params: { id: order.id } })}
          />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <MDButton
              label="Continue Shopping"
              variant="outline"
              style={{ flex: 1 }}
              onPress={() => router.replace('/(buyer)/products')}
            />
            <MDButton
              label="Download Invoice"
              variant="outline"
              style={{ flex: 1 }}
              onPress={() => toast.show('Invoice sent to your email.', 'success')}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
