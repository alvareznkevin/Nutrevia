import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { router, Stack } from 'expo-router';

import { api } from '@/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';


export default function AuthLayout() {
  const theme = useTheme();
  const [canShowAuth, setCanShowAuth] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const destination =
          await api.getStartupDestination();

        if (destination === '/login') {
          setCanShowAuth(true);
          return;
        }

        router.replace(destination);
      } catch (error) {
        console.error(
          'Error comprobando la sesión:',
          error,
        );

        setCanShowAuth(true);
      }
    };

    checkSession();
  }, []);

  if (!canShowAuth) {
    return (
      <ThemedView
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator
          size="large"
          color={theme.accent}
        />

        <ThemedText
          themeColor="textSecondary"
          style={{ marginTop: Spacing.three }}
        >
          Comprobando sesión…
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}