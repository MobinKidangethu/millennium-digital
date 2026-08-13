import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDText } from '@/design-system';

export interface SpecRow {
  label: string;
  value: string;
}

interface MDSpecTableProps {
  title: string;
  rows: SpecRow[];
  /** Optional Ionicons name shown in a tinted circle beside the title. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Extra layout style — e.g. `{ flex: 1 }` when placed in a 3-column panel row. */
  style?: object;
}

export function MDSpecTable({ title, rows, icon, style }: MDSpecTableProps) {
  const visibleRows = rows.filter((r) => r.value && r.value.trim().length > 0);
  if (visibleRows.length === 0) return null;

  return (
    <View style={[{ marginBottom: spacing.xl }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
        {icon ? (
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: radius.md,
              backgroundColor: colors.brand.primarySoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name={icon} size={15} color={colors.brand.primary} />
          </View>
        ) : null}
        <MDText variant="h4">{title}</MDText>
      </View>
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
