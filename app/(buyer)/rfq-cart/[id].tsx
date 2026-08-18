import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, MDButton, MDEmptyState, MDText } from '@/design-system';
import { useRfq } from '@/features/rfq';
import { rfqStageIndex } from '@/constants/rfqLifecycle';
import { RfqOrderSummary } from '@/components/RfqOrderSummary';
import { ProtoBadge } from '@/components/ProtoBadge';
import { useAuthStore } from '@/state';

/**
 * Entry point to the RFQ's own cart/checkout journey — deliberately
 * separate from app/(buyer)/cart (which is the shared, product-browsing
 * cart backed by useCartStore). An RFQ never lands in that shared cart;
 * once the buyer approves shipment (see account/rfq-status/[id].tsx), it
 * lands here instead, then proceeds to app/(buyer)/rfq-checkout/[id].tsx.
 */
export default function RfqCart() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const session = useAuthStore((s) => s.session);
  const { data: rfq, isLoading } = useRfq(id);

  if (!hasHydrated || isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  const ready = !!rfq && rfqStageIndex(rfq.status) >= rfqStageIndex('shipment_approved');

  if (!rfq || !ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <MDEmptyState
          icon={<Ionicons name="cart-outline" size={40} color={colors.text.tertiary} />}
          title={rfq ? 'This RFQ isn’t ready for checkout yet' : 'RFQ not found'}
          description={rfq ? 'The RFQ cart unlocks once you’ve approved it for shipment.' : undefined}
          actionLabel="View RFQ Order Status"
          onAction={() => (rfq ? router.push({ pathname: '/(buyer)/account/rfq-status/[id]', params: { id: rfq.id } }) : router.push('/(buyer)/account/rfq-status'))}
        />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: 640, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <MDText variant="h1" style={{ marginBottom: spacing.xs }}>
          RFQ Cart
        </MDText>
        <View style={{ marginBottom: spacing.lg }}>
          <ProtoBadge label="Separate from your regular cart — this RFQ has its own dedicated checkout" />
        </View>

        <RfqOrderSummary rfq={rfq} />

        <MDButton
          label="Proceed to RFQ Checkout"
          size="lg"
          fullWidth
          iconLeft={<Ionicons name="arrow-forward" size={16} color={colors.gray[0]} />}
          onPress={() => router.push({ pathname: '/(buyer)/rfq-checkout/[id]', params: { id: rfq.id } })}
        />
      </View>
    </ScrollView>
  );
}
