import { View } from 'react-native';
import { colors, spacing, MDText } from '@/design-system';

export interface SpecRow {
  label: string;
  value: string;
}

interface MDSpecTableProps {
  title: string;
  rows: SpecRow[];
}

export function MDSpecTable({ title, rows }: MDSpecTableProps) {
  const visibleRows = rows.filter((r) => r.value && r.value.trim().length > 0);
  if (visibleRows.length === 0) return null;

  return (
    <View style={{ marginBottom: spacing.xl }}>
      <MDText variant="h4" style={{ marginBottom: spacing.md }}>
        {title}
      </MDText>
      <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, overflow: 'hidden' }}>
        {visibleRows.map((row, index) => (
          <View
            key={row.label}
            style={{
              flexDirection: 'row',
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              backgroundColor: index % 2 === 0 ? colors.surface : colors.surfaceRaised,
            }}
          >
            <MDText variant="bodySm" tone="secondary" style={{ flex: 1 }}>
              {row.label}
            </MDText>
            <MDText variant="bodySm" weight="600" style={{ flex: 1 }}>
              {row.value}
            </MDText>
          </View>
        ))}
      </View>
    </View>
  );
}
