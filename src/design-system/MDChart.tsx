import { View } from 'react-native';
import { colors, radius, spacing } from './tokens';
import { MDText } from './MDText';

export interface ChartDatum {
  label: string;
  value: number;
}

interface MDChartProps {
  data: ChartDatum[];
  height?: number;
  formatValue?: (value: number) => string;
  barColor?: string;
}

/** A simple, readable vertical bar chart — used for the handful of charts that actually answer a question (sales trend, top categories/products, inventory mix). */
export function MDChart({ data, height = 180, formatValue, barColor = colors.brand.primary }: MDChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height, gap: spacing.md }}>
      {data.map((d) => {
        const barHeight = Math.max(4, (d.value / max) * (height - 40));
        return (
          <View key={d.label} style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}>
            <MDText variant="caption" tone="tertiary">
              {formatValue ? formatValue(d.value) : d.value}
            </MDText>
            <View
              style={{
                width: '100%',
                maxWidth: 40,
                height: barHeight,
                backgroundColor: barColor,
                borderRadius: radius.sm,
              }}
            />
            <MDText variant="caption" tone="secondary" numberOfLines={1} align="center">
              {d.label}
            </MDText>
          </View>
        );
      })}
    </View>
  );
}
