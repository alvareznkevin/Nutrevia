import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface BadgeProps {
  label: string;
  tone?: 'accent' | 'neutral';
}

export function Badge({ label, tone = 'accent' }: BadgeProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: tone === 'accent' ? theme.accent : theme.backgroundElement,
        paddingHorizontal: Spacing.two,
        paddingVertical: Spacing.half,
        borderRadius: 999,
        alignSelf: 'flex-start',
      }}
    >
      <ThemedText style={{ fontSize: 12, fontWeight: '600', color: tone === 'accent' ? '#000' : theme.text }}>
        {label}
      </ThemedText>
    </View>
  );
}