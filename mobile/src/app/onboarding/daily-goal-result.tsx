import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { api } from '@/api';
import { NutritionGoalResult } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';


export default function DailyGoalResultScreen() {
  const theme = useTheme();

  const [goal, setGoal] =
    useState<NutritionGoalResult | null>(null);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadGoal = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await api.getNutritionGoal();
      setGoal(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible cargar el objetivo.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoal();
  }, []);

  const finishOnboarding = () => {
    router.replace('/home');
  };

  if (isLoading) {
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
          Calculando tu objetivo…
        </ThemedText>
      </ThemedView>
    );
  }

  if (!goal || errorMessage) {
    return (
      <ThemedView
        style={{
          flex: 1,
          padding: Spacing.four,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ThemedText
          style={{
            color: '#ef4444',
            textAlign: 'center',
          }}
        >
          {errorMessage ?? 'No existe un objetivo nutricional.'}
        </ThemedText>

        <TouchableOpacity
          onPress={loadGoal}
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
      </ThemedView>
    );
  }

  const macros = [
    {
      label: 'Proteínas',
      value: goal.proteinGrams,
    },
    {
      label: 'Carbohidratos',
      value: goal.carbohydrateGrams,
    },
    {
      label: 'Grasas',
      value: goal.fatGrams,
    },
  ];

  return (
    <ThemedView
      style={{
        flex: 1,
        padding: Spacing.four,
        alignItems: 'center',
      }}
    >
      <ThemedText
        themeColor="accent"
        style={{
          fontSize: 32,
          marginTop: Spacing.four,
        }}
      >
        ✓
      </ThemedText>

      <ThemedText
        type="subtitle"
        style={{ marginTop: Spacing.three }}
      >
        Tu objetivo diario
      </ThemedText>

      <ThemedText
        themeColor="textSecondary"
        type="small"
        style={{
          textAlign: 'center',
          marginTop: Spacing.one,
        }}
      >
        Calculado según tu perfil, actividad y objetivo.
      </ThemedText>

      <ThemedView
        type="backgroundElement"
        style={{
          borderRadius: Spacing.four,
          padding: Spacing.four,
          marginTop: Spacing.four,
          width: '100%',
          alignItems: 'center',
        }}
      >
        <ThemedText themeColor="accent" type="small">
          Calorías diarias
        </ThemedText>

        <ThemedText type="title">
          {goal.dailyCalories} kcal
        </ThemedText>
      </ThemedView>

      <View
        style={{
          flexDirection: 'row',
          gap: Spacing.two,
          marginTop: Spacing.three,
          width: '100%',
        }}
      >
        {macros.map((macro) => (
          <ThemedView
            key={macro.label}
            type="backgroundElement"
            style={{
              flex: 1,
              borderRadius: Spacing.three,
              padding: Spacing.two,
              alignItems: 'center',
            }}
          >
            <ThemedText
              type="small"
              themeColor="textSecondary"
            >
              {macro.label}
            </ThemedText>

            <ThemedText type="smallBold">
              {macro.value} g
            </ThemedText>
          </ThemedView>
        ))}
      </View>

      <TouchableOpacity
        onPress={finishOnboarding}
        style={{
          backgroundColor: theme.accent,
          padding: Spacing.four,
          borderRadius: Spacing.three,
          marginTop: Spacing.six,
          width: '100%',
        }}
      >
        <ThemedText
          style={{
            textAlign: 'center',
            fontWeight: '700',
            color: '#000',
          }}
        >
          Confirmar objetivo
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}