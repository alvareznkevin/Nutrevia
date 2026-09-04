import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { api } from '@/api';
import { DailySummary } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';


export default function HomeScreen() {
  const theme = useTheme();

  const [summary, setSummary] =
    useState<DailySummary | null>(null);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadSummary = async () => {
    setErrorMessage(null);

    try {
      const result = await api.getDailySummary();
      setSummary(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible cargar el resumen.',
      );
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  if (!summary && !errorMessage) {
    return (
      <ActivityIndicator
        style={{ flex: 1 }}
        color={theme.accent}
      />
    );
  }

  if (!summary) {
    return (
      <ThemedView
        style={{
          flex: 1,
          padding: Spacing.four,
          justifyContent: 'center',
        }}
      >
        <ThemedText
          style={{
            color: '#ef4444',
            textAlign: 'center',
          }}
        >
          {errorMessage}
        </ThemedText>

        <TouchableOpacity
          onPress={loadSummary}
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
              textAlign: 'center',
            }}
          >
            Intentar nuevamente
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const macros = [
    {
      label: 'Proteínas',
      consumed: summary.consumedMacros.protein,
      goal: summary.goal.protein,
    },
    {
      label: 'Carbohidratos',
      consumed: summary.consumedMacros.carbs,
      goal: summary.goal.carbs,
    },
    {
      label: 'Grasas',
      consumed: summary.consumedMacros.fat,
      goal: summary.goal.fat,
    },
  ];

  return (
    <ThemedView
      style={{
        flex: 1,
        padding: Spacing.four,
      }}
    >
      <ThemedText type="title">
        Buenos días
      </ThemedText>

      <ThemedText
        themeColor="accent"
        type="small"
        style={{ marginTop: Spacing.one }}
      >
        Tu progreso de hoy
      </ThemedText>

      <ThemedView
        type="backgroundElement"
        style={{
          borderRadius: Spacing.four,
          padding: Spacing.four,
          marginTop: Spacing.four,
        }}
      >
        <ThemedText>Resumen diario</ThemedText>

        <ThemedText
          type="title"
          style={{ marginTop: Spacing.one }}
        >
          {summary.consumedCalories} / {summary.goal.calories} kcal
        </ThemedText>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: Spacing.three,
          }}
        >
          {macros.map((macro) => (
            <View key={macro.label}>
              <ThemedText
                themeColor="accent"
                type="small"
              >
                {macro.label}
              </ThemedText>

              <ThemedText type="small">
                {macro.consumed} / {macro.goal} g
              </ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>

      <ThemedText
        type="smallBold"
        style={{ marginTop: Spacing.four }}
      >
        Registrar comida
      </ThemedText>

      <TouchableOpacity
        onPress={() => router.push('/camera')}
        style={{
          backgroundColor: theme.accent,
          padding: Spacing.four,
          borderRadius: Spacing.three,
          marginTop: Spacing.two,
        }}
      >
        <ThemedText
          style={{
            textAlign: 'center',
            fontWeight: '700',
            color: '#000',
          }}
        >
          📷 Fotografiar comida
        </ThemedText>
      </TouchableOpacity>

      <View
        style={{
          flexDirection: 'row',
          gap: Spacing.two,
          marginTop: Spacing.two,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push('/barcode-scan')}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: theme.border,
            padding: Spacing.three,
            borderRadius: Spacing.three,
          }}
        >
          <ThemedText style={{ textAlign: 'center' }}>
            ▤ Código de barras
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/manual-search')}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: theme.border,
            padding: Spacing.three,
            borderRadius: Spacing.three,
          }}
        >
          <ThemedText style={{ textAlign: 'center' }}>
            🔍 Búsqueda manual
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}