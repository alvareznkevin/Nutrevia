import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';

import { api } from '@/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';


export default function InitialScreen() {
  const theme = useTheme();

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const resolveInitialRoute = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const destination = await api.getStartupDestination();
      router.replace(destination);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible iniciar la aplicación.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    resolveInitialRoute();
  }, []);

  return (
    <ThemedView
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.four,
      }}
    >
      {isLoading ? (
        <>
          <ActivityIndicator
            size="large"
            color={theme.accent}
          />

          <ThemedText
            themeColor="textSecondary"
            style={{ marginTop: Spacing.three }}
          >
            Preparando Nutrevia…
          </ThemedText>
        </>
      ) : (
        <>
          <ThemedText
            style={{
              color: '#ef4444',
              textAlign: 'center',
            }}
          >
            {errorMessage}
          </ThemedText>

          <TouchableOpacity
            onPress={resolveInitialRoute}
            style={{
              backgroundColor: theme.accent,
              padding: Spacing.four,
              borderRadius: Spacing.three,
              marginTop: Spacing.four,
            }}
          >
            <ThemedText
              style={{
                color: '#000',
                fontWeight: '700',
              }}
            >
              Intentar nuevamente
            </ThemedText>
          </TouchableOpacity>
        </>
      )}
    </ThemedView>
  );
}