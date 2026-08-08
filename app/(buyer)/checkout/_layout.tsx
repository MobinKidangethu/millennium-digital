import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { colors, spacing } from '@/design-system';
import { useAuthStore } from '@/state';

export default function CheckoutLayout() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const session = useAuthStore((s) => s.session);

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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: 720, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </ScrollView>
  );
}
