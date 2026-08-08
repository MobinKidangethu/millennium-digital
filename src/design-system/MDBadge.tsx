import { View } from 'react-native';
import { colors, radius, spacing } from './tokens';
import { MDText } from './MDText';

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';

interface MDBadgeProps {
  label: string;
  tone?: BadgeTone;
  size?: 'sm' | 'md';
}

const TONE_STYLES: Record<BadgeTone, { bg: string; fg: string }> = {
  neutral: { bg: colors.gray[100], fg: colors.text.secondary },
  brand: { bg: colors.brand.primarySoft, fg: colors.brand.primary },
  success: { bg: colors.status.successSoft, fg: colors.status.successStrong },
  warning: { bg: colors.status.warningSoft, fg: colors.status.warningStrong },
  error: { bg: colors.status.errorSoft, fg: colors.status.errorStrong },
  info: { bg: colors.status.infoSoft, fg: colors.brand.primary },
};

export function MDBadge({ label, tone = 'neutral', size = 'sm' }: MDBadgeProps) {
  const palette = TONE_STYLES[tone];

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: palette.bg,
        borderRadius: radius.pill,
        paddingHorizontal: size === 'sm' ? spacing.sm : spacing.md,
        paddingVertical: size === 'sm' ? 3 : spacing.xs,
      }}
    >
      <MDText variant={size === 'sm' ? 'caption' : 'bodySm'} weight="600" style={{ color: palette.fg }}>
        {label}
      </MDText>
    </View>
  );
}
