import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDText } from '@/design-system';

type ProtoKind = 'prototype' | 'target';

const KIND_CONFIG: Record<ProtoKind, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  prototype: { label: 'Prototype Simulation', icon: 'flask-outline' },
  target: { label: 'Target Production Architecture', icon: 'construct-outline' },
};

/**
 * Honesty label used anywhere a mocked/simulated capability is shown
 * (AI, BOM matching, governed pricing, ERP/inventory sync, logistics
 * tracking) so the evaluation panel never mistakes a demo for a live
 * integration — see project rule: never represent mocked features as
 * production integrations.
 */
export function ProtoBadge({ kind = 'prototype', label }: { kind?: ProtoKind; label?: string }) {
  const config = KIND_CONFIG[kind];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        backgroundColor: colors.amber[50],
        borderRadius: radius.pill,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
      }}
    >
      <Ionicons name={config.icon} size={11} color={colors.amber[600]} />
      <MDText variant="caption" weight="600" style={{ color: colors.amber[600] }}>
        {label ?? config.label}
      </MDText>
    </View>
  );
}
