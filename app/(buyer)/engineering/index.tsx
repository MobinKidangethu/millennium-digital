import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout, radius, shadow, spacing, useResponsive, MDButton, MDText } from '@/design-system';
import { ProtoBadge } from '@/components/ProtoBadge';

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

interface WorkspaceCard {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel: string;
  href: string;
  tone: 'brand' | 'neutral';
}

const CARDS: WorkspaceCard[] = [
  {
    icon: 'sparkles-outline',
    title: 'AI Engineering Search',
    description: 'Describe a requirement in plain language and get structured, explainable component matches.',
    actionLabel: 'Search with AI',
    href: '/(buyer)/ai-search',
    tone: 'brand',
  },
  {
    icon: 'document-attach-outline',
    title: 'BOM & Component Matching',
    description: 'Upload a bill of materials, get exact + alternative matches, and move straight into an RFQ.',
    actionLabel: 'Start BOM Matching',
    href: '/(buyer)/bom',
    tone: 'brand',
  },
  {
    icon: 'construct-outline',
    title: 'Design Request',
    description: 'Send our engineering team a structured brief — application, requirement, quantity, target cost.',
    actionLabel: 'Submit a Design Request',
    href: '/(buyer)/design-request',
    tone: 'neutral',
  },
  {
    icon: 'options-outline',
    title: 'Parametric Category Discovery',
    description: 'Browse by manufacturer, technology, mounting style, package, RoHS and availability.',
    actionLabel: 'Browse Categories',
    href: '/(buyer)/category',
    tone: 'neutral',
  },
  {
    icon: 'business-outline',
    title: 'Supplier Network',
    description: 'Explore manufacturer portfolios — product breadth, RoHS coverage, and documentation.',
    actionLabel: 'View Manufacturers',
    href: '/(buyer)/manufacturers',
    tone: 'neutral',
  },
  {
    icon: 'cube-outline',
    title: 'Innovation Lab — AR / 3D Visualization',
    description: 'Camera-based component identification and 3D part visualization, planned as a roadmap add-on.',
    actionLabel: 'Preview Concept',
    href: '/(buyer)/engineering/innovation-lab',
    tone: 'neutral',
  },
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
          {CARDS.map((card) => (
            <View
              key={card.title}
              style={[
                {
                  width: columns === 1 ? '100%' : columns === 2 ? '47.5%' : '31.5%',
                  backgroundColor: colors.surfaceRaised,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: card.tone === 'brand' ? colors.brand.primarySoftBorder : colors.border,
                  padding: spacing.lg,
                  gap: spacing.sm,
                },
                shadow.sm,
              ]}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.md,
                  backgroundColor: card.tone === 'brand' ? colors.brand.primarySoft : colors.gray[100],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={card.icon} size={20} color={card.tone === 'brand' ? colors.brand.primary : colors.text.secondary} />
              </View>
              <MDText variant="h4">{card.title}</MDText>
              <MDText variant="bodySm" tone="secondary" style={{ minHeight: 40 }}>
                {card.description}
              </MDText>
              <MDButton
                label={card.actionLabel}
                variant={card.tone === 'brand' ? 'primary' : 'outline'}
                size="sm"
                style={{ alignSelf: 'flex-start', marginTop: spacing.xs }}
                onPress={() => router.push(card.href as never)}
              />
            </View>
          ))}
        </View>

        <View style={{ marginTop: spacing['2xl'] }}>
          <ProtoBadge label="AI, BOM matching, and governed pricing shown here are prototype simulations — see each screen for details" />
        </View>
      </View>
    </ScrollView>
  );
}
