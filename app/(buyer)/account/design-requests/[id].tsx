import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDBadge, MDButton, MDEmptyState, MDText } from '@/design-system';
import { designRequestService } from '@/features/designRequests';
import { DESIGN_REQUEST_STAGE_LABEL, DESIGN_REQUEST_STATUS_TONE, DESIGN_REQUEST_STAGES, designRequestStageIndex } from '@/constants/designRequestLifecycle';
import { DesignRequestStatusTracker } from '@/components/DesignRequestStatusTracker';
import { ProtoBadge } from '@/components/ProtoBadge';
import type { DesignRequest } from '@/types';

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={{ marginBottom: spacing.md }}>
      <MDText variant="caption" tone="tertiary" style={{ marginBottom: 2 }}>
        {label}
      </MDText>
      <MDText variant="bodySm">{value}</MDText>
    </View>
  );
}

export default function DesignRequestDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [request, setRequest] = useState<DesignRequest | null | undefined>(null);

  useEffect(() => {
    if (!id) return;
    setRequest(null);
    designRequestService.getDesignRequestById(id).then((r) => setRequest(r ?? undefined));
  }, [id]);

  if (request === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (!request) {
    return (
      <MDEmptyState title="Design request not found" actionLabel="View My Design Requests" onAction={() => router.push('/(buyer)/account/design-requests')} />
    );
  }

  const currentIndex = designRequestStageIndex(request.status);
  const currentStage = DESIGN_REQUEST_STAGES[currentIndex];

  return (
    <View style={{ maxWidth: 720, width: '100%' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg }}>
        <View>
          <MDText variant="h2">{request.projectName}</MDText>
          <MDText variant="bodySm" tone="secondary" style={{ marginTop: 2 }}>
            {request.referenceNumber} · Submitted{' '}
            {new Date(request.submittedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </MDText>
        </View>
        <MDBadge label={DESIGN_REQUEST_STAGE_LABEL[request.status]} tone={DESIGN_REQUEST_STATUS_TONE[request.status]} />
      </View>

      <View style={{ marginBottom: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
          <MDText variant="h4">Review Status</MDText>
          <ProtoBadge label="Prototype simulation — advanced by Millennium Digital engineering" />
        </View>
        <DesignRequestStatusTracker status={request.status} />
        {currentStage ? (
          <MDText variant="caption" tone="tertiary" style={{ marginTop: spacing.sm }}>
            {currentStage.description}
          </MDText>
        ) : null}
      </View>

      {request.sourcePartNumber ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            padding: spacing.md,
            borderRadius: radius.md,
            backgroundColor: colors.status.warningSoft,
            marginBottom: spacing.lg,
          }}
        >
          <Ionicons name="git-branch-outline" size={16} color={colors.status.warningStrong} />
          <MDText variant="bodySm" style={{ color: colors.status.warningStrong, flex: 1 }}>
            Raised from a BOM line — {request.sourceDesignator ? `${request.sourceDesignator} · ` : ''}
            {request.sourcePartNumber}
          </MDText>
        </View>
      ) : null}

      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.lg,
          marginBottom: spacing.xl,
        }}
      >
        <MDText variant="h4" style={{ marginBottom: spacing.md }}>
          Request Details
        </MDText>
        <DetailRow label="Application" value={request.application} />
        <DetailRow label="Technical Requirement" value={request.technicalRequirement} />
        <DetailRow label="Target Quantity" value={request.targetQuantity} />
        <DetailRow label="Target Cost" value={request.targetCost} />
        <DetailRow label="Required Date" value={request.requiredDate} />
        <DetailRow label="Additional Requirements" value={request.additionalRequirements} />
        <DetailRow label="Contact" value={request.contactName ? `${request.contactName}${request.contactEmail ? ` · ${request.contactEmail}` : ''}` : request.contactEmail} />
        <DetailRow label="BOM File" value={request.bomFileName} />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <MDButton label="Back to My Design Requests" variant="outline" onPress={() => router.push('/(buyer)/account/design-requests')} />
        <MDButton label="Contact Support" variant="ghost" onPress={() => router.push('/(buyer)/help')} />
      </View>
    </View>
  );
}
