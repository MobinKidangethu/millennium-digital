import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDText } from '@/design-system';

interface MDStatsCardProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: 'neutral' | 'success' | 'warning' | 'error';
  trend?: { value: string; positive: boolean };
}

const TONE_BG: Record<NonNullable<MDStatsCardProps['tone']>, string> = {
  neutral: colors.brand.primarySoft,
  success: colors.status.successSoft,
  warning: colors.status.warningSoft,
  error: colors.status.errorSoft,
};

const TONE_FG: Record<NonNullable<MDStatsCardProps['tone']>, string> = {
  neutral: colors.brand.primary,
  success: colors.status.successStrong,
  warning: colors.status.warningStrong,
  error: colors.status.errorStrong,
};

export function MDStatsCard({ label, value, icon, tone = 'neutral', trend }: MDStatsCardProps) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 160,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: spacing.lg,
        backgroundColor: colors.surfaceRaised,
        gap: spacing.sm,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: radius.md,
          backgroundColor: TONE_BG[tone],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={18} color={TONE_FG[tone]} />
      </View>
      <MDText variant="h2">{value}</MDText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
        <MDText variant="bodySm" tone="secondary">
          {label}
        </MDText>
        {trend ? (
          <MDText variant="caption" weight="700" style={{ color: trend.positive ? colors.status.successStrong : colors.status.errorStrong }}>
            {trend.positive ? '▲' : '▼'} {trend.value}
          </MDText>
        ) : null}
      </View>
    </View>
  );
}
