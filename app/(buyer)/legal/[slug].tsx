import { ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, spacing, MDEmptyState, MDText } from '@/design-system';
import { LEGAL_PAGES } from '@/constants/legalContent';

export default function LegalPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const page = slug ? LEGAL_PAGES[slug] : undefined;

  if (!page) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <MDEmptyState title="Page not found" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: 640, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <MDText variant="h1" style={{ marginBottom: spacing.lg }}>
          {page.title}
        </MDText>
        {page.body.map((paragraph, i) => (
          <MDText key={i} variant="body" tone="secondary" style={{ marginBottom: spacing.md, lineHeight: 24 }}>
            {paragraph}
          </MDText>
        ))}
      </View>
    </ScrollView>
  );
}
