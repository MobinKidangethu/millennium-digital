import { ScrollView, View } from 'react-native';
import { colors, spacing, MDText } from '@/design-system';

export default function Dashboard() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl }}>
        <MDText variant="h1">Dashboard</MDText>
        <MDText variant="body" tone="secondary" style={{ marginTop: spacing.sm }}>
          Admin shell is wired up — full dashboard next.
        </MDText>
      </View>
    </ScrollView>
  );
}
