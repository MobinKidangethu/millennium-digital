import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { colors, spacing, useResponsive } from '@/design-system';
import { useAuthStore } from '@/state';
import { CheckoutOrderSummary } from '@/components/CheckoutOrderSummary';

export default function CheckoutLayout() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const session = useAuthStore((s) => s.session);
  const { isDesktopUp } = useResponsive();

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  // Order Summary stays visible across every step (address, shipping,
  // payment, review) so the buyer never loses sight of what they're
  // paying for — a sticky sidebar on desktop, a stacked card on mobile.
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          maxWidth: 1120,
          width: '100%',
          alignSelf: 'center',
          padding: spacing.xl,
          flexDirection: isDesktopUp ? 'row' : 'column',
          gap: spacing['2xl'],
          alignItems: 'flex-start',
        }}
      >
        <View style={{ flex: isDesktopUp ? 2 : undefined, width: isDesktopUp ? undefined : '100%' }}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
        <View
          style={
            isDesktopUp
              ? { flex: 1, width: '100%', position: 'sticky', top: spacing.xl } as any
              : { width: '100%' }
          }
        >
          <CheckoutOrderSummary />
        </View>
      </View>
    </ScrollView>
  );
}
