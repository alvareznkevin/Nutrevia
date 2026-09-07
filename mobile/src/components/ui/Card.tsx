import { View, ViewProps } from 'react-native';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Card({ style, children, ...rest }: ViewProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.backgroundElement,
          borderRadius: Spacing.four,
          padding: Spacing.four,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}