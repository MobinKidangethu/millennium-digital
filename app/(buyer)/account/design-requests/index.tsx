import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDBadge, MDButton, MDEmptyState, MDSkeleton, MDText } from '@/design-system';
import { designRequestService } from '@/features/designRequests';
import { DESIGN_REQUEST_STAGE_LABEL, DESIGN_REQUEST_STATUS_TONE } from '@/constants/designRequestLifecycle';
import { ProtoBadge } from '@/components/ProtoBadge';
import type { DesignRequest } from '@/types';

export default function MyDesignRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<DesignRequest[] | null>(null);

  useEffect(() => {
    designRequestService.getDesignRequests().then(setRequests);
  }, []);

  return (
    <View>
      <MDText variant="h2" style={{ marginBottom: spacing.xs }}>
        My Design Requests
      </MDText>
      <View style={{ marginBottom: spacing.md }}>
        <ProtoBadge label="Design request intake — prototype simulation" />
      </View>

      {requests === null ? (
        <View style={{ gap: spacing.sm }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <MDSkeleton key={i} height={90} radius={12} />
          ))}
        </View>
      ) : requests.length === 0 ? (
        <MDEmptyState
          icon={<Ionicons name="construct-outline" size={36} color={colors.text.tertiary} />}
          title="No design requests yet"
          description="Send our engineering team a structured brief and track it here."
          actionLabel="Start a Design Request"
          onAction={() => router.push('/(buyer)/design-request')}
        />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {requests.map((request) => (
            <Pressable
              key={request.id}
              onPress={() => router.push({ pathname: '/(buyer)/account/design-requests/[id]', params: { id: request.id } })}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                padding: spacing.md,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs }}>
                <View style={{ flex: 1 }}>
                  <MDText variant="bodySm" weight="700">{request.projectName}</MDText>
                  <MDText variant="caption" tone="tertiary">
                    {request.referenceNumber} ·{' '}
                    {new Date(request.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </MDText>
                </View>
                <MDBadge label={DESIGN_REQUEST_STAGE_LABEL[request.status]} tone={DESIGN_REQUEST_STATUS_TONE[request.status]} />
              </View>
              <MDText variant="caption" tone="secondary" numberOfLines={2}>
                {request.technicalRequirement}
              </MDText>
              {request.sourcePartNumber ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs }}>
                  <Ionicons name="git-branch-outline" size={12} color={colors.text.tertiary} />
                  <MDText variant="caption" tone="tertiary">
                    From BOM · {request.sourceDesignator ? `${request.sourceDesignator} · ` : ''}
                    {request.sourcePartNumber}
                  </MDText>
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>
      )}

      {requests && requests.length > 0 ? (
        <MDButton
          label="Start a New Design Request"
          variant="outline"
          size="sm"
          style={{ marginTop: spacing.md, alignSelf: 'flex-start' }}
          iconLeft={<Ionicons name="add" size={16} color={colors.brand.primary} />}
          onPress={() => router.push('/(buyer)/design-request')}
        />
      ) : null}
    </View>
  );
}
