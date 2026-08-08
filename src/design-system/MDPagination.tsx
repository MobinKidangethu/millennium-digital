import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from './tokens';
import { MDText } from './MDText';
import { MDIconButton } from './MDIconButton';

interface MDPaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function MDPagination({ page, totalPages, onChange }: MDPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingVertical: spacing.lg }}>
      <MDIconButton accessibilityLabel="Previous page" variant="outline" disabled={page <= 1} onPress={() => onChange(page - 1)}>
        <Ionicons name="chevron-back" size={16} color={colors.text.primary} />
      </MDIconButton>
      <MDText variant="bodySm">
        Page {page} of {totalPages}
      </MDText>
      <MDIconButton accessibilityLabel="Next page" variant="outline" disabled={page >= totalPages} onPress={() => onChange(page + 1)}>
        <Ionicons name="chevron-forward" size={16} color={colors.text.primary} />
      </MDIconButton>
    </View>
  );
}
