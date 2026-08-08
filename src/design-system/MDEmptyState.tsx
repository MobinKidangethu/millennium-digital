import type { ReactNode } from 'react';
import { View } from 'react-native';
import { spacing } from './tokens';
import { MDText } from './MDText';
import { MDButton } from './MDButton';

interface MDEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export function MDEmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  compact,
}: MDEmptyStateProps) {
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
      {icon}
      <MDText variant="h4" align="center" style={{ marginTop: icon ? spacing.md : 0 }}>
        {title}
      </MDText>
      {description ? (
        <MDText variant="body" tone="secondary" align="center" style={{ maxWidth: 360 }}>
          {description}
        </MDText>
      ) : null}
      {actionLabel && onAction ? (
        <MDButton label={actionLabel} onPress={onAction} style={{ marginTop: spacing.md }} />
      ) : null}
    </View>
  );
}
