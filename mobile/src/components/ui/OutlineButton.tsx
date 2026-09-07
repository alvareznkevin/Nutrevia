import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface OutlineButtonProps extends TouchableOpacityProps {
  label: string;
  tone?: 'default' | 'accent';
  icon?: React.ReactNode;
}

export function OutlineButton({ label, tone = 'default', icon, style, ...rest }: OutlineButtonProps) {
  const theme = useTheme();
  const borderColor = tone === 'accent' ? theme.accent : theme.border;
  const textColor = tone === 'accent' ? theme.accent : theme.text;

  return (
    <TouchableOpacity
      style={[
        { borderWidth: 1, borderColor, padding: Spacing.three, borderRadius: Spacing.three },
        style,
      ]}
      {...rest}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two }}>
        {icon}
        <ThemedText style={{ textAlign: 'center', fontWeight: tone === 'accent' ? '700' : '400', color: textColor }}>
          {label}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}