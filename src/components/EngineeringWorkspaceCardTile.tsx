import { useState } from 'react';
import { Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, MDButton, MDText } from '@/design-system';
import type { WorkspaceCard } from '@/constants/engineeringWorkspaceCards';

/**
 * Shared tile for an Engineering Workspace tool — real photo + icon badge +
 * title/description/action. Used on both the dedicated /(buyer)/engineering
 * page and the homepage "Engineering Workspace" teaser so the two surfaces
 * stay visually identical instead of drifting into separate designs.
 */
export function EngineeringWorkspaceCardTile({
  card,
  columns,
  onPress,
}: {
  card: WorkspaceCard;
  columns: number;
  onPress: () => void;
}) {
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
