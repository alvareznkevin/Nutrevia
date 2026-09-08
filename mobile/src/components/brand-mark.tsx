import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

interface BrandMarkProps {
  centered?: boolean;
  compact?: boolean;
}

export function BrandMark({ centered = false, compact = false }: BrandMarkProps) {
  const theme = useTheme();

  return (
    <View style={{ alignItems: centered ? 'center' : 'flex-start' }}>
      <ThemedText
        style={{
          fontSize: compact ? 18 : 24,
          lineHeight: compact ? 24 : 30,
          fontWeight: '800',
          letterSpacing: compact ? 4 : 5,
        }}
      >
        NUTREVI
        <ThemedText
          style={{
            color: theme.accent,
            fontSize: compact ? 18 : 24,
            lineHeight: compact ? 24 : 30,
            fontWeight: '800',
            letterSpacing: compact ? 4 : 5,
          }}
        >
          A
        </ThemedText>
      </ThemedText>
    </View>
  );
}
