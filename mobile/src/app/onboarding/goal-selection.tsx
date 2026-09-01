import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { api } from '@/api';
import { GoalType } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';


const options: {
  id: GoalType;
  title: string;
  subtitle: string;
  icon: string;
}[] = [
  {
    id: 'lose',
    title: 'Perder peso',
    subtitle: 'Reducir el peso de forma gradual.',
    icon: '↓',
  },
  {
    id: 'maintain',
    title: 'Mantener peso',
    subtitle: 'Conservar tu peso actual.',
    icon: '=',
  },
  {
    id: 'gain',
    title: 'Aumentar peso',
    subtitle: 'Incrementar el peso de forma gradual.',
    icon: '↑',
  },
];


export default function GoalSelectionScreen() {
  const theme = useTheme();

  const [selected, setSelected] =
    useState<GoalType>('maintain');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true);

    try {
      await api.saveNutritionGoal(selected);
      router.push('/onboarding/daily-goal-result');
    } catch (error) {
      Alert.alert(
        'No fue posible calcular el objetivo',
        error instanceof Error
          ? error.message
          : 'Inténtalo nuevamente.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView
      style={{
        flex: 1,
        padding: Spacing.four,
      }}
    >
      <ThemedText type="small" themeColor="accent">
        Paso 2 de 2
      </ThemedText>

      <ThemedText
        type="subtitle"
        style={{ marginTop: Spacing.two }}
      >
        ¿Cuál es tu objetivo?
      </ThemedText>

      {options.map((option) => {
        const isSelected = selected === option.id;

        return (
          <TouchableOpacity
            key={option.id}
            disabled={isLoading}
            onPress={() => setSelected(option.id)}
            style={{
              borderWidth: 1,
              borderColor: isSelected
                ? theme.accent
                : theme.border,
              borderRadius: Spacing.three,
              padding: Spacing.four,
              marginTop: Spacing.three,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: Spacing.two,
                flex: 1,
              }}
            >
              <ThemedText
                themeColor="accent"
                style={{ fontSize: 20 }}
              >
                {option.icon}
              </ThemedText>

              <View style={{ flex: 1 }}>
                <ThemedText type="smallBold">
                  {option.title}
                </ThemedText>

                <ThemedText
                  themeColor="textSecondary"
                  type="small"
                >
                  {option.subtitle}
                </ThemedText>
              </View>
            </View>

            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor: theme.accent,
                backgroundColor: isSelected
                  ? theme.accent
                  : 'transparent',
              }}
            />
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        onPress={handleContinue}
        disabled={isLoading}
        style={{
          backgroundColor: theme.accent,
          padding: Spacing.four,
          borderRadius: Spacing.three,
          marginTop: Spacing.six,
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        {isLoading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <ThemedText
            style={{
              textAlign: 'center',
              fontWeight: '700',
              color: '#000',
            }}
          >
            Calcular mi objetivo
          </ThemedText>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
}