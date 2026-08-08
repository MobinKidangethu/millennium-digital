import { View } from 'react-native';
import { colors, radius, spacing, MDText } from '@/design-system';

interface MDStockStatusProps {
  stockStatus: string;
  availability?: number;
  size?: 'sm' | 'md';
}

function toneFor(stockStatus: string): { dot: string; text: string } {
  const s = stockStatus.toLowerCase();
  if (s.includes('out')) return { dot: colors.status.error, text: colors.status.errorStrong };
  if (s.includes('low') || s.includes('limited') || s.includes('backorder')) {
    return { dot: colors.status.warning, text: colors.status.warningStrong };
  }
  return { dot: colors.status.success, text: colors.status.successStrong };
}

export function MDStockStatus({ stockStatus, availability, size = 'sm' }: MDStockStatusProps) {
  const tone = toneFor(stockStatus);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: radius.pill,
          backgroundColor: tone.dot,
        }}
      />
      <MDText variant={size === 'sm' ? 'caption' : 'bodySm'} weight="600" style={{ color: tone.text }}>
        {stockStatus}
        {availability != null ? ` · ${availability.toLocaleString()} avail.` : ''}
      </MDText>
    </View>
  );
}
