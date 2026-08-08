import { View } from 'react-native';
import { colors, radius, spacing } from './tokens';
import { MDText } from './MDText';
import { MDButton } from './MDButton';

interface MDErrorStateProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function MDErrorState({
  title = 'Something went wrong',
  description = "We couldn't load this right now. Please try again.",
  retryLabel = 'Try again',
  onRetry,
  compact,
}: MDErrorStateProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: compact ? spacing['2xl'] : spacing['4xl'],
        paddingHorizontal: spacing.xl,
        gap: spacing.sm,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: radius.pill,
          backgroundColor: colors.status.errorSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MDText style={{ color: colors.status.error, fontSize: 20 }} weight="700">
          !
        </MDText>
      </View>
      <MDText variant="h4" align="center" style={{ marginTop: spacing.sm }}>
        {title}
      </MDText>
      <MDText variant="body" tone="secondary" align="center" style={{ maxWidth: 360 }}>
        {description}
      </MDText>
      {onRetry ? (
        <MDButton
          label={retryLabel}
          variant="outline"
          onPress={onRetry}
          style={{ marginTop: spacing.md }}
        />
      ) : null}
    </View>
  );
}
