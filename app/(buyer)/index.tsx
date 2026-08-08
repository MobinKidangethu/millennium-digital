import { ScrollView, View } from 'react-native';
import { colors, spacing, MDText } from '@/design-system';

export default function Home() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.xl }}>
        <MDText variant="h1">Home</MDText>
        <MDText variant="body" tone="secondary" style={{ marginTop: spacing.sm }}>
          Buyer shell is wired up — full home page next.
        </MDText>
      </View>
    </ScrollView>
  );
}
