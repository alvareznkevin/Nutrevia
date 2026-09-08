import { View, ViewProps } from 'react-native';
import { AppPalette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Card({ style, children, ...rest }: ViewProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.backgroundElement,
          borderRadius: 20,
          padding: Spacing.four,
          borderWidth: 1,
          borderColor: AppPalette.border,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
