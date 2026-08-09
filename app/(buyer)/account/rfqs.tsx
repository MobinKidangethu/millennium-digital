import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDBadge, MDButton, MDEmptyState, MDSkeleton, MDText } from '@/design-system';
import { rfqService } from '@/features/rfq';
import { ProtoBadge } from '@/components/ProtoBadge';
import type { Rfq, RfqStatus } from '@/types';

const SOURCE_LABEL: Record<string, string> = {
  bom: 'BOM Component Matching',
  'ai-search': 'AI Engineering Search',
  manual: 'Manual Request',
  cart: 'Cart',
};

const STATUS_TONE: Record<RfqStatus, 'brand' | 'success' | 'warning' | 'neutral'> = {
  draft: 'neutral',
  submitted: 'brand',
  quoted: 'warning',
  approved: 'success',
};

export default function MyRfqs() {
  const router = useRouter();
  const [rfqs, setRfqs] = useState<Rfq[] | null>(null);

  useEffect(() => {
    rfqService.getRfqs().then(setRfqs);
  }, []);

  return (
    <View>
      <MDText variant="h2" style={{ marginBottom: spacing.xs }}>
        My RFQs
      </MDText>
      <View style={{ marginBottom: spacing.md }}>
        <ProtoBadge label="RFQ history — prototype simulation" />
      </View>

      {rfqs === null ? (
        <View style={{ gap: spacing.sm }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <MDSkeleton key={i} height={84} radius={12} />
          ))}
        </View>
      ) : rfqs.length === 0 ? (
        <MDEmptyState
          icon={<Ionicons name="document-text-outline" size={36} color={colors.text.tertiary} />}
          title="No RFQs yet"
          description="Request a quote from AI Search or a BOM match and it will show up here."
          actionLabel="Start AI Search"
          onAction={() => router.push('/(buyer)/ai-search')}
        />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {rfqs.map((rfq) => (
            <View
              key={rfq.id}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                padding: spacing.md,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs }}>
                <View>
                  <MDText variant="bodySm" weight="700">{rfq.rfqNumber}</MDText>
                  <MDText variant="caption" tone="tertiary">
                    {SOURCE_LABEL[rfq.source] ?? rfq.source} ·{' '}
                    {new Date(rfq.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' · '}
                    {rfq.lines.length} line item{rfq.lines.length === 1 ? '' : 's'}
                  </MDText>
                </View>
                <MDBadge label={rfq.status} tone={STATUS_TONE[rfq.status]} />
              </View>

              <MDButton
                label="View RFQ"
                size="sm"
                variant="outline"
                onPress={() => router.push({ pathname: '/(buyer)/rfq/[id]', params: { id: rfq.id } })}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
