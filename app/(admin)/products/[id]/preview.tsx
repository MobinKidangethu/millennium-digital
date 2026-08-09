import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, useToast, MDBadge, MDButton, MDEmptyState, MDText } from '@/design-system';
import { useProductAdmin, useSetProductPublished } from '@/features/products';
import { useGovernanceStore } from '@/state';
import { GOVERNANCE_STAGE_DESCRIPTION, GOVERNANCE_STAGE_LABEL, nextStage } from '@/features/governance/service';
import { MDProductImage } from '@/components/MDProductImage';
import { MDManufacturerLogo } from '@/components/MDManufacturerLogo';
import { MDPrice } from '@/components/MDPrice';
import { MDStockStatus } from '@/components/MDStockStatus';
import { MDSpecTable } from '@/components/MDSpecTable';
import { GovernanceTracker } from '@/components/GovernanceTracker';
import type { GovernanceStage } from '@/types';

type ActorRole = 'Maker' | 'Checker' | 'Business Approver';

const ROLE_REQUIRED_FOR: Partial<Record<GovernanceStage, ActorRole>> = {
  draft: 'Maker',
  submitted: 'Maker',
  maker_validated: 'Checker',
  checker_validated: 'Business Approver',
  business_approved: 'Business Approver',
};

export default function ProductPreview() {
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading } = useProductAdmin(Number(id));
  const setPublished = useSetProductPublished();
  const getRecord = useGovernanceStore((s) => s.getRecord);
  const advance = useGovernanceStore((s) => s.advance);
  const [actorRole, setActorRole] = useState<ActorRole>('Maker');

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <MDEmptyState title="Product not found" actionLabel="Back to Products" onAction={() => router.push('/(admin)/products')} />
      </View>
    );
  }

  const governance = getRecord('product', String(product.id));
  const upcoming = nextStage(governance.stage);
  const requiredRole = upcoming ? ROLE_REQUIRED_FOR[governance.stage] : undefined;
  const canAdvance = !!upcoming && (!requiredRole || requiredRole === actorRole);

  const handleAdvance = () => {
    if (!upcoming) return;
    const next = advance('product', String(product.id), actorRole);
    if (next === 'published') {
      setPublished.mutate({ id: product.id, isPublished: true });
    }
    toast.show(`${GOVERNANCE_STAGE_LABEL[next!]} recorded by ${actorRole}.`, 'success');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl, maxWidth: 900 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
          <MDText variant="h1">Product Preview</MDText>
          <MDButton
            label="Edit Product"
            variant="outline"
            onPress={() => router.push({ pathname: '/(admin)/products/[id]/edit', params: { id: String(product.id) } })}
          />
        </View>

        {!product.isPublished ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              backgroundColor: colors.status.warningSoft,
              borderRadius: radius.md,
              padding: spacing.md,
              marginBottom: spacing.xl,
            }}
          >
            <Ionicons name="eye-off-outline" size={18} color={colors.status.warningStrong} />
            <MDText variant="bodySm" style={{ color: colors.status.warningStrong }}>
              This product is unpublished and not visible to buyers.
            </MDText>
          </View>
        ) : null}

        <View style={{ backgroundColor: colors.surfaceRaised, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xl }}>
          <View style={{ flexDirection: 'row', gap: spacing['2xl'], marginBottom: spacing.xl }}>
            <View style={{ width: 240, aspectRatio: 1 }}>
              <MDProductImage imagePath={product.image} alt={product.title} style={{ width: '100%', height: '100%' }} />
            </View>
            <View style={{ flex: 1, gap: spacing.sm }}>
              <MDManufacturerLogo manufacturer={product.manufacturer} width={120} height={28} />
              <MDText variant="h2">{product.manufacturerPartNumber}</MDText>
              <MDText variant="body" tone="secondary">
                {product.title}
              </MDText>
              <MDPrice amount={product.price} currency={product.currency} size="lg" />
              <MDStockStatus stockStatus={product.stockStatus} availability={product.availability} size="md" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs }}>
                {product.tags.map((tag) => (
                  <MDBadge key={tag} label={tag} tone="brand" />
                ))}
                {product.rohs ? <MDBadge label="RoHS" tone="success" /> : null}
              </View>
            </View>
          </View>

          <MDSpecTable
            title="Product Information"
            rows={[
              { label: 'Manufacturer', value: product.manufacturer },
              { label: 'Category', value: product.category },
              { label: 'Product Type', value: product.productType },
              { label: 'Package', value: product.package },
              { label: 'Technology', value: product.technology },
            ]}
          />
        </View>

        <View
          style={{
            backgroundColor: colors.surfaceRaised,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.xl,
            marginTop: spacing.xl,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md, flexWrap: 'wrap', gap: spacing.sm }}>
            <MDText variant="h4">Maker-Checker Governance</MDText>
            <MDBadge label={GOVERNANCE_STAGE_LABEL[governance.stage]} tone={governance.stage === 'published' ? 'success' : 'brand'} />
          </View>
          <MDText variant="bodySm" tone="secondary" style={{ marginBottom: spacing.lg }}>
            {GOVERNANCE_STAGE_DESCRIPTION[governance.stage]}
          </MDText>

          <GovernanceTracker stage={governance.stage} />

          {upcoming ? (
            <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
              <View>
                <MDText variant="bodySm" weight="600" style={{ marginBottom: spacing.sm }}>
                  Acting as
                </MDText>
                <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
                  {(['Maker', 'Checker', 'Business Approver'] as ActorRole[]).map((role) => (
                    <Pressable
                      key={role}
                      onPress={() => setActorRole(role)}
                      style={{
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.xs,
                        borderRadius: radius.pill,
                        borderWidth: 1,
                        borderColor: actorRole === role ? colors.brand.primary : colors.border,
                        backgroundColor: actorRole === role ? colors.brand.primarySoft : 'transparent',
                      }}
                    >
                      <MDText variant="caption" weight={actorRole === role ? '700' : '400'} style={{ color: actorRole === role ? colors.brand.primary : colors.text.secondary }}>
                        {role}
                      </MDText>
                    </Pressable>
                  ))}
                </View>
              </View>

              {!canAdvance ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Ionicons name="lock-closed-outline" size={14} color={colors.status.warningStrong} />
                  <MDText variant="caption" style={{ color: colors.status.warningStrong }}>
                    This transition requires the {requiredRole} role — the Maker cannot certify its own release.
                  </MDText>
                </View>
              ) : null}

              <MDButton
                label={`Record ${GOVERNANCE_STAGE_LABEL[upcoming]}`}
                onPress={handleAdvance}
                disabled={!canAdvance}
                loading={setPublished.isPending && upcoming === 'published'}
              />
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md }}>
              <Ionicons name="checkmark-circle" size={16} color={colors.status.successStrong} />
              <MDText variant="bodySm" style={{ color: colors.status.successStrong }}>
                Fully governed and published — no further stages.
              </MDText>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
