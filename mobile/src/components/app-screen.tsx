import { ReactNode } from 'react';
import {
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppPalette, Spacing } from '@/constants/theme';

interface AppScreenProps {
  children: ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

export function AppScreen({
  children,
  scroll = false,
  contentContainerStyle,
  keyboardShouldPersistTaps,
}: AppScreenProps) {
  const contentStyle = [
    {
      flexGrow: 1,
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.three,
      paddingBottom: Spacing.six,
    },
    contentContainerStyle,
  ];

  return (
    <View style={{ flex: 1, backgroundColor: AppPalette.backgroundBottom }}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: 210,
          top: -180,
          right: -160,
          backgroundColor: 'rgba(18, 99, 70, 0.3)',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 360,
          height: 360,
          borderRadius: 180,
          bottom: -220,
          left: -170,
          backgroundColor: 'rgba(19, 83, 62, 0.24)',
        }}
      />
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={{ flex: 1 }}
      >
        {scroll ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={contentStyle}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={contentStyle}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}
