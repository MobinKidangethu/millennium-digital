import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout, radius, spacing, useResponsive, MDButton, MDCard, MDText } from '@/design-system';
import { useManufacturers, useProducts } from '@/features/products';
import { MDStatsCard } from '@/components/MDStatsCard';
import { MDBreadcrumb } from '@/components/MDBreadcrumb';
import { ProtoBadge } from '@/components/ProtoBadge';

interface LifecyclePhase {
  title: string;
  description: string;
  steps: string[];
}

const LIFECYCLE_PHASES: LifecyclePhase[] = [
  {
    title: 'Onboard',
    description: 'Get verified and set up your catalogue.',
    steps: ['Registration', 'Verification', 'Catalogue Setup'],
  },
  {
    title: 'Publish',
    description: 'Every listing is independently reviewed before it goes live.',
    steps: ['Product Submission', 'Maker Review', 'Checker Validation', 'Business Approval', 'Publishing'],
  },
  {
    title: 'Operate',
    description: 'Run your business inside the marketplace.',
    steps: ['Inventory', 'Pricing', 'RFQ Response', 'Order Fulfillment', 'Analytics'],
  },
];

const VALUE_PROPS: { icon: keyof typeof Ionicons.glyphMap; title: string; description: string }[] = [
  {
    icon: 'people-outline',
    title: 'Demand from Engineers & Procurement',
    description: 'Your catalogue surfaces directly in parametric search, AI engineering search, and BOM matching.',
  },
  {
    icon: 'document-text-outline',
    title: 'Structured RFQ Pipeline',
    description: 'Receive RFQs with full technical context — part, quantity, and buyer requirement — not a bare email.',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Governed Publishing',
    description: 'Maker-Checker review keeps every listing trustworthy before it reaches a buyer.',
  },
  {
    icon: 'stats-chart-outline',
    title: 'Performance Analytics',
    description: 'Product-level visibility into RFQs, orders, and fulfillment performance.',
  },
];

export default function SupplierLanding() {
  const router = useRouter();
  const { isDesktopUp } = useResponsive();
  const { data: manufacturers } = useManufacturers();
  const { data: products } = useProducts({});

  const categoryCount = products ? new Set(products.map((p) => p.category)).size : 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <MDBreadcrumb items={[{ label: 'Home', href: '/(buyer)' }, { label: 'Supplier Network' }]} />

        <View style={{ marginTop: spacing.lg, marginBottom: spacing.xl, maxWidth: 680 }}>
          <MDText variant="overline" tone="tertiary" style={{ marginBottom: spacing.xs }}>
            SUPPLIER NETWORK
          </MDText>
          <MDText variant="h1">Join the Millennium Digital Marketplace</MDText>
          <MDText variant="body" tone="secondary" style={{ marginTop: spacing.sm }}>
            Millennium Digital connects engineers, procurement teams, and suppliers in one ecosystem.
            List your catalogue where demand is already searching — by part number, parametric spec, and
            AI-assisted engineering requirement.
          </MDText>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing['2xl'] }}>
          <MDStatsCard label="Manufacturers on the platform" value={String(manufacturers?.length ?? 0)} icon="business-outline" />
          <MDStatsCard label="Live products" value={String(products?.length ?? 0)} icon="cube-outline" />
          <MDStatsCard label="Categories" value={String(categoryCount)} icon="grid-outline" />
        </View>

        <MDText variant="h2" style={{ marginBottom: spacing.lg }}>
          The Supplier Lifecycle
        </MDText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, marginBottom: spacing['2xl'] }}>
          {LIFECYCLE_PHASES.map((phase, index) => (
            <MDCard key={phase.title} padding="lg" style={{ width: isDesktopUp ? '31.5%' : '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: radius.pill,
                    backgroundColor: colors.brand.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MDText variant="caption" weight="700" style={{ color: colors.gray[0] }}>
                    {index + 1}
                  </MDText>
                </View>
                <MDText variant="h4">{phase.title}</MDText>
              </View>
              <MDText variant="bodySm" tone="secondary" style={{ marginBottom: spacing.md }}>
                {phase.description}
              </MDText>
              <View style={{ gap: spacing.xs }}>
                {phase.steps.map((step) => (
                  <View key={step} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <Ionicons name="checkmark-circle-outline" size={14} color={colors.brand.primary} />
                    <MDText variant="caption" tone="secondary">
                      {step}
                    </MDText>
                  </View>
                ))}
              </View>
            </MDCard>
          ))}
        </View>

        <MDText variant="h2" style={{ marginBottom: spacing.lg }}>
          Why Sell Through Millennium Digital
        </MDText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, marginBottom: spacing['2xl'] }}>
          {VALUE_PROPS.map((item) => (
            <View
              key={item.title}
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
              <Ionicons name={item.icon} size={20} color={colors.brand.primary} />
              <MDText variant="bodyMedium">{item.title}</MDText>
              <MDText variant="bodySm" tone="secondary">
                {item.description}
              </MDText>
            </View>
          ))}
        </View>

        <MDCard
          padding="lg"
          style={{
            marginBottom: spacing['2xl'],
            flexDirection: isDesktopUp ? 'row' : 'column',
            alignItems: isDesktopUp ? 'center' : 'flex-start',
            justifyContent: 'space-between',
            gap: spacing.lg,
            backgroundColor: colors.gray[900],
            borderColor: colors.gray[800],
          }}
        >
          <View style={{ flex: 1 }}>
            <MDText variant="h4" style={{ color: colors.gray[0], marginBottom: spacing.xs }}>
              Ready to Apply?
            </MDText>
            <MDText variant="bodySm" style={{ color: colors.gray[400], marginBottom: spacing.sm, maxWidth: 440 }}>
              Register your business details, GST/registration number, and product categories — our
              partnerships team verifies applications before granting console access.
            </MDText>
            <ProtoBadge label="Seller onboarding — prototype simulation" />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
            <MDButton
              label="Start Seller Application"
              iconLeft={<Ionicons name="arrow-forward" size={16} color={colors.gray[0]} />}
              onPress={() => router.push('/(auth)/seller-register')}
            />
          </View>
        </MDCard>

        <View style={{ flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' }}>
          <MDButton label="View Manufacturer Directory" variant="outline" onPress={() => router.push('/(buyer)/manufacturers')} />
          <MDButton label="Back to Home" variant="ghost" onPress={() => router.push('/(buyer)')} />
        </View>
      </View>
    </ScrollView>
  );
}
