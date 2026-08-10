import { useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
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
  /** Real photo (Unsplash, free license) representing the tool concept — same sourcing pattern as SegmentCarousel/CategoryImages. */
  imageUrl: string;
  accent: string;
}

const CARDS: WorkspaceCard[] = [
  {
    icon: 'sparkles-outline',
    title: 'AI Engineering Search',
    description: 'Describe a requirement in plain language and get structured, explainable component matches.',
    actionLabel: 'Search with AI',
    href: '/(buyer)/ai-search',
    tone: 'brand',
    imageUrl: 'https://images.unsplash.com/photo-1743796055664-3473eedab36e?auto=format&fit=crop&w=800&q=80',
    accent: colors.brand.primary,
  },
  {
    icon: 'document-attach-outline',
    title: 'BOM & Component Matching',
    description: 'Upload a bill of materials, get exact + alternative matches, and move straight into an RFQ.',
    actionLabel: 'Start BOM Matching',
    href: '/(buyer)/bom',
    tone: 'brand',
    imageUrl: 'https://images.unsplash.com/photo-1739025530417-3d57a2e685f2?auto=format&fit=crop&w=800&q=80',
    accent: colors.teal[500],
  },
  {
    icon: 'construct-outline',
    title: 'Design Request',
    description: 'Send our engineering team a structured brief — application, requirement, quantity, target cost.',
    actionLabel: 'Submit a Design Request',
    href: '/(buyer)/design-request',
    tone: 'neutral',
    imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    accent: colors.plum[400],
  },
  {
    icon: 'options-outline',
    title: 'Parametric Category Discovery',
    description: 'Browse by manufacturer, technology, mounting style, package, RoHS and availability.',
    actionLabel: 'Browse Categories',
    href: '/(buyer)/category',
    tone: 'neutral',
    imageUrl: 'https://images.unsplash.com/photo-1586256053828-a36b572ab01d?auto=format&fit=crop&w=800&q=80',
    accent: colors.status.success,
  },
  {
    icon: 'business-outline',
    title: 'Supplier Network',
    description: 'Explore manufacturer portfolios — product breadth, RoHS coverage, and documentation.',
    actionLabel: 'View Manufacturers',
    href: '/(buyer)/manufacturers',
    tone: 'neutral',
    imageUrl: 'https://images.unsplash.com/photo-1685483749753-0dab7e144794?auto=format&fit=crop&w=800&q=80',
    accent: colors.amber[600],
  },
  {
    icon: 'cube-outline',
    title: 'Innovation Lab — AR / 3D Visualization',
    description: 'Camera-based component identification and 3D part visualization, planned as a roadmap add-on.',
    actionLabel: 'Preview Concept',
    href: '/(buyer)/engineering/innovation-lab',
    tone: 'neutral',
    imageUrl: 'https://images.unsplash.com/photo-1758523670487-fe71f10c1080?auto=format&fit=crop&w=800&q=80',
    accent: colors.teal[700],
  },
];

function WorkspaceCardTile({ card, columns, onPress }: { card: WorkspaceCard; columns: number; onPress: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <View
      style={[
        {
          width: columns === 1 ? '100%' : columns === 2 ? '47.5%' : '31.5%',
          backgroundColor: colors.surfaceRaised,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: card.tone === 'brand' ? colors.brand.primarySoftBorder : colors.border,
          overflow: 'hidden',
          gap: spacing.sm,
        },
        shadow.sm,
      ]}
    >
      <View style={{ height: 110, backgroundColor: `${card.accent}1A` }}>
        {!imageFailed ? (
          <Image
            source={{ uri: card.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
            accessibilityLabel={card.title}
          />
        ) : null}
        <View style={{ position: 'absolute', bottom: -18, left: spacing.lg }}>
          <View
            style={[
              {
                width: 40,
                height: 40,
                borderRadius: radius.md,
                backgroundColor: colors.gray[0],
                borderWidth: 1,
                borderColor: card.accent,
                alignItems: 'center',
                justifyContent: 'center',
              },
              shadow.sm,
            ]}
          >
            <Ionicons name={card.icon} size={19} color={card.accent} />
          </View>
        </View>
      </View>
      <View style={{ padding: spacing.lg, paddingTop: spacing.lg + 18, gap: spacing.sm }}>
        <MDText variant="h4">{card.title}</MDText>
        <MDText variant="bodySm" tone="secondary" style={{ minHeight: 40 }}>
          {card.description}
        </MDText>
        <MDButton
          label={card.actionLabel}
          variant={card.tone === 'brand' ? 'primary' : 'outline'}
          size="sm"
          style={{ alignSelf: 'flex-start', marginTop: spacing.xs }}
          onPress={onPress}
        />
      </View>
    </View>
  );
}

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
            <WorkspaceCardTile key={card.title} card={card} columns={columns} onPress={() => router.push(card.href as never)} />
          ))}
        </View>

        <View style={{ marginTop: spacing['2xl'] }}>
          <ProtoBadge label="AI, BOM matching, and governed pricing shown here are prototype simulations — see each screen for details" />
        </View>
      </View>
    </ScrollView>
  );
}
