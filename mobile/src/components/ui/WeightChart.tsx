import { View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { WeightEntry } from '@/api/types';
import { formatWeightDate } from '@/api/weightDate';
import { useTheme } from '@/hooks/use-theme';

interface WeightChartProps {
  entries: WeightEntry[]; // ya ordenadas de más antiguo a más reciente
  height?: number;
}

const CHART_WIDTH = 320;
const PADDING_X = 24;
const PADDING_Y = 20;

export function WeightChart({ entries, height = 160 }: WeightChartProps) {
  const theme = useTheme();

  if (entries.length === 0) {
    return null;
  }

  const weights = entries.map((entry) => entry.weightKg);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  // Si todos los pesos son iguales, evita dividir por 0 dándole un rango mínimo.
  const range = maxWeight - minWeight || 1;

  const usableWidth = CHART_WIDTH - PADDING_X * 2;
  const usableHeight = height - PADDING_Y * 2;

  const points = entries.map((entry, index) => {
    const x = entries.length === 1
      ? CHART_WIDTH / 2
      : PADDING_X + (index / (entries.length - 1)) * usableWidth;
    const y = PADDING_Y + usableHeight - ((entry.weightKg - minWeight) / range) * usableHeight;
    return { x, y, entry };
  });

  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${CHART_WIDTH} ${height}`}>
        <Line
          x1={PADDING_X}
          y1={height - PADDING_Y}
          x2={CHART_WIDTH - PADDING_X}
          y2={height - PADDING_Y}
          stroke={theme.border}
          strokeWidth={1}
        />

        <Polyline points={polylinePoints} fill="none" stroke={theme.accent} strokeWidth={2} />

        {points.map((point) => (
          <Circle key={point.entry.id} cx={point.x} cy={point.y} r={3} fill={theme.accent} />
        ))}

        {points.map((point, index) => (
          index === 0 || (points.length > 1 && index === points.length - 1) ? (
            <SvgText
              key={`label-${index}`}
              x={point.x}
              y={height - 4}
              fontSize={10}
              fill={theme.textSecondary}
              textAnchor={index === 0 ? 'start' : 'end'}
            >
              {formatWeightDate(point.entry.recordedOn)}
            </SvgText>
          ) : null
        ))}
      </Svg>
    </View>
  );
}
