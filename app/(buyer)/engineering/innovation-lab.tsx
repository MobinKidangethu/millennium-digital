import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout, radius, spacing, useResponsive, MDButton, MDText } from '@/design-system';
import { ProtoBadge } from '@/components/ProtoBadge';

interface ConceptCard {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const CONCEPTS: ConceptCard[] = [
  {
    icon: 'camera-outline',
    title: 'AR Component Identification',
    description:
      'Point a phone camera at a physical part or package marking to identify it and jump straight to its catalog page and alternatives.',
  },
  {
    icon: 'cube-outline',
    title: '3D Product Visualization',
    description:
      'Interactive 3D models for footprint, package, and mechanical clearance checks before committing to a design.',
  },
  {
    icon: 'scan-outline',
    title: 'Visual Component Lookup',
    description:
      'Photograph an existing BOM, datasheet page, or board to extract candidate part numbers automatically.',
  },
  {
    icon: 'cube-outline',
    title: 'Warehouse & Logistics Visualization',
    description:
      'Immersive views of fulfillment and shipment status for high-value or time-critical orders.',
  },
];

export default function InnovationLab() {
  const router = useRouter();
  const { isDesktopUp } = useResponsive();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <MDText variant="overline" tone="tertiary" style={{ marginBottom: spacing.xs }}>
          INNOVATION LAB
        </MDText>
        <MDText variant="h1" style={{ marginBottom: spacing.sm }}>
          AR, 3D & Visual Component Intelligence
        </MDText>
        <MDText variant="body" tone="secondary" style={{ marginBottom: spacing.md, maxWidth: 680 }}>
          These are roadmap concepts, not shipped features — shown here so evaluators can see how AR/VR fits
          the long-term platform vision without pulling focus from the core B2B commerce workflows.
        </MDText>
        <ProtoBadge kind="target" label="Roadmap concept — not implemented in this prototype" />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, marginTop: spacing.xl }}>
          {CONCEPTS.map((concept) => (
            <View
              key={concept.title}
              style={{
                width: isDesktopUp ? '47.5%' : '100%',
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.lg,
                gap: spacing.sm,
                backgroundColor: colors.surfaceRaised,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.md,
                  backgroundColor: colors.brand.primarySoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={concept.icon} size={20} color={colors.brand.primary} />
              </View>
              <MDText variant="h4">{concept.title}</MDText>
              <MDText variant="bodySm" tone="secondary">
                {concept.description}
              </MDText>
            </View>
          ))}
        </View>

        <MDButton
          label="Back to Engineering Workspace"
          variant="outline"
          style={{ marginTop: spacing['2xl'], alignSelf: 'flex-start' }}
          onPress={() => router.push('/(buyer)/engineering')}
        />
      </View>
    </ScrollView>
  );
}
