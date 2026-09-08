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
          minHeight: 58,
          paddingHorizontal: Spacing.four,
          paddingVertical: Spacing.three,
          borderRadius: 14,
          justifyContent: 'center',
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
          <ThemedText style={{ textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#04150E' }}>
            {label}
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
}
