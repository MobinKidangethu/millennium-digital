import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { colors, radius, spacing } from './tokens';
import { MDText } from './MDText';
import { MDEmptyState } from './MDEmptyState';

export interface MDTableColumn<T> {
  key: string;
  label: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
  render: (row: T) => ReactNode;
}

interface MDTableProps<T> {
  columns: MDTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowPress?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function MDTable<T>({ columns, data, keyExtractor, onRowPress, emptyTitle, emptyDescription }: MDTableProps<T>) {
  if (data.length === 0) {
    return <MDEmptyState title={emptyTitle ?? 'Nothing here yet'} description={emptyDescription} compact />;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ minWidth: '100%', borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          {columns.map((col) => (
            <View key={col.key} style={{ width: col.width ?? 140, paddingVertical: spacing.sm, paddingHorizontal: spacing.md }}>
              <MDText variant="caption" weight="700" tone="secondary" align={col.align}>
                {col.label}
              </MDText>
            </View>
          ))}
        </View>

        {data.map((row, index) => {
          const rowContent = (
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: colors.surfaceRaised,
                borderBottomWidth: index < data.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
              }}
            >
              {columns.map((col) => (
                <View key={col.key} style={{ width: col.width ?? 140, paddingVertical: spacing.md, paddingHorizontal: spacing.md, justifyContent: 'center' }}>
                  {col.render(row)}
                </View>
              ))}
            </View>
          );

          if (onRowPress) {
            return (
              <Pressable key={keyExtractor(row)} onPress={() => onRowPress(row)}>
                {rowContent}
              </Pressable>
            );
          }
          return <View key={keyExtractor(row)}>{rowContent}</View>;
        })}
      </View>
    </ScrollView>
  );
}
