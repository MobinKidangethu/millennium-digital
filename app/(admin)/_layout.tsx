import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { colors, useResponsive } from '@/design-system';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useAuthStore } from '@/state';

export default function AdminLayout() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const session = useAuthStore((s) => s.session);
  const { isDesktopUp } = useResponsive();

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray[900] }}>
        <ActivityIndicator color={colors.gray[0]} />
      </View>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return <Redirect href="/(auth)/admin-login" />;
  }

  return (
    <View style={{ flex: 1, flexDirection: isDesktopUp ? 'row' : 'column', backgroundColor: colors.surface }}>
      {isDesktopUp ? <AdminSidebar /> : null}
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}
