import { ActivityIndicator, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface OutlineButtonProps extends TouchableOpacityProps {
  label: string;
  tone?: 'default' | 'accent' | 'error';
  icon?: React.ReactNode;
  loading?: boolean;
}

export function OutlineButton({ label, tone = 'default', icon, loading, disabled, style, ...rest }: OutlineButtonProps) {
  const theme = useTheme();
  const borderColor = tone === 'accent' ? theme.accent : tone === 'error' ? '#e57373' : theme.border;
  const textColor = tone === 'accent' ? theme.accent : tone === 'error' ? '#e57373' : theme.text;

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      style={[
        { borderWidth: 1, borderColor, padding: Spacing.three, borderRadius: Spacing.three, opacity: disabled || loading ? 0.6 : 1 },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two }}>
          {icon}
          <ThemedText style={{ textAlign: 'center', fontWeight: tone === 'default' ? '400' : '700', color: textColor }}>
            {label}
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
}