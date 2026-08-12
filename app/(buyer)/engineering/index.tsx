import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout, radius, spacing, useResponsive, MDText } from '@/design-system';
import { ProtoBadge } from '@/components/ProtoBadge';
import { EngineeringWorkspaceCardTile } from '@/components/EngineeringWorkspaceCardTile';
import { ENGINEERING_WORKSPACE_CARDS } from '@/constants/engineeringWorkspaceCards';

const JOURNEY_STEPS = [
  'Design',
  'Component',
  'BOM',
  'Source',
  'RFQ',
  'Quote',
  'Approval',
  'Procurement',
  'Fulfillment',
  'Logistics',
  'Delivery',
];

export default function EngineeringWorkspace() {
  const router = useRouter();
  const { isDesktopUp, isTabletUp } = useResponsive();
  const columns = isDesktopUp ? 3 : isTabletUp ? 2 : 1;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <MDText variant="overline" tone="tertiary" style={{ marginBottom: spacing.xs }}>
          ENGINEERING WORKSPACE
        </MDText>
        <MDText variant="h1" style={{ marginBottom: spacing.xs }}>
          Tools Built for How Engineers Source Components
        </MDText>
        <MDText variant="body" tone="secondary" style={{ marginBottom: spacing.xl, maxWidth: 680 }}>
          Everything beyond browse-and-buy — AI-assisted search, BOM intake, supplier discovery, and a direct
          line to our engineering team.
        </MDText>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.lg,
            marginBottom: spacing['2xl'],
          }}
        >
          <MDText variant="bodyMedium" style={{ marginBottom: spacing.md }}>
            One connected journey — not separate tools
          </MDText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {JOURNEY_STEPS.map((step, index) => (
                <View key={step} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.xs,
                      borderRadius: radius.pill,
                      backgroundColor: colors.surfaceRaised,
                      borderWidth: 1,
                      borderColor: colors.brand.primarySoftBorder,
                    }}
                  >
                    <MDText variant="caption" weight="600" style={{ color: colors.brand.primary }}>
                      {step}
                    </MDText>
                  </View>
                  {index < JOURNEY_STEPS.length - 1 ? (
                    <Ionicons name="arrow-forward" size={12} color={colors.text.tertiary} style={{ marginHorizontal: spacing.xs }} />
                  ) : null}
                </View>
              ))}
            </View>
          </ScrollView>
          <MDText variant="caption" tone="tertiary" style={{ marginTop: spacing.sm }}>
            Today: Discover, Engineer, and Source stages are live below. Procure, Fulfill, and Logistics stages
            are demonstrated through the BOM → RFQ → Cart → Checkout → Order → Tracking flow.
          </MDText>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
          {ENGINEERING_WORKSPACE_CARDS.map((card) => (
            <EngineeringWorkspaceCardTile key={card.title} card={card} columns={columns} onPress={() => router.push(card.href as never)} />
          ))}
        </View>

        <View style={{ marginTop: spacing['2xl'] }}>
          <ProtoBadge label="AI, BOM matching, and governed pricing shown here are prototype simulations — see each screen for details" />
        </View>
      </View>
    </ScrollView>
  );
}
