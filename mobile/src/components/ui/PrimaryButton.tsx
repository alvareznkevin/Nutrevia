import { ActivityIndicator, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface PrimaryButtonProps extends TouchableOpacityProps {
  label: string;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function PrimaryButton({ label, loading, icon, disabled, style, ...rest }: PrimaryButtonProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      style={[
        {
          backgroundColor: theme.accent,
          padding: Spacing.four,
          borderRadius: Spacing.three,
          opacity: disabled || loading ? 0.6 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#000" />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two }}>
          {icon}
          <ThemedText style={{ textAlign: 'center', fontWeight: '700', color: '#000' }}>
            {label}
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
}