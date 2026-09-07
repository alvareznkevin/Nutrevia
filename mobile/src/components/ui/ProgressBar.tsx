import { View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface ProgressBarProps {
  value: number;   // ej: 1250
  max: number;     // ej: 2200
}

export function ProgressBar({ value, max }: ProgressBarProps) {
  const theme = useTheme();
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: theme.border, overflow: 'hidden' }}>
      <View style={{ width: `${percentage}%`, height: '100%', backgroundColor: theme.accent }} />
    </View>
  );
}