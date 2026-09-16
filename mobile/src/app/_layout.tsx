import { DarkTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <StatusBar style="light" />
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="camera" options={{ presentation: 'modal' }} />
        <Stack.Screen name="review-meal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="manual-search" options={{ presentation: 'modal' }} />
        <Stack.Screen name="barcode-scan" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
