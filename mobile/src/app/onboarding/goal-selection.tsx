import { useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowDown, Equal, ArrowUp, LucideIcon } from 'lucide-react-native';

import { api } from '@/api';
import { GoalType } from '@/api/types';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';


const options: {
  id: GoalType;
  title: string;
  subtitle: string;
  icon: LucideIcon;
}[] = [
  { id: 'lose', title: 'Perder peso', subtitle: 'Reducir el peso de forma gradual.', icon: ArrowDown },
  { id: 'maintain', title: 'Mantener peso', subtitle: 'Conservar tu peso actual.', icon: Equal },
  { id: 'gain', title: 'Aumentar peso', subtitle: 'Incrementar el peso de forma gradual.', icon: ArrowUp },
];


export default function GoalSelectionScreen() {
  const theme = useTheme();

  const [selected, setSelected] = useState<GoalType>('maintain');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true);

    try {
      await api.saveNutritionGoal(selected);
      router.push('/onboarding/daily-goal-result');
    } catch (error) {
      Alert.alert(
        'No fue posible calcular el objetivo',
        error instanceof Error ? error.message : 'Inténtalo nuevamente.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1, padding: Spacing.four }}>
      <ThemedText type="small" themeColor="accent">Paso 2 de 2</ThemedText>

      <ThemedText type="subtitle" style={{ marginTop: Spacing.two }}>
        ¿Cuál es tu objetivo?
      </ThemedText>

      {options.map((option) => {
        const isSelected = selected === option.id;
        const Icon = option.icon;

        return (
          <TouchableOpacity
            key={option.id}
            disabled={isLoading}
            onPress={() => setSelected(option.id)}
            style={{
              borderWidth: 1,
              borderColor: isSelected ? theme.accent : theme.border,
              borderRadius: Spacing.three,
              padding: Spacing.four,
              marginTop: Spacing.three,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flex: 1 }}>
              <Icon color={theme.accent} size={20} />

              <View style={{ flex: 1 }}>
                <ThemedText type="smallBold">{option.title}</ThemedText>
                <ThemedText themeColor="textSecondary" type="small">{option.subtitle}</ThemedText>
              </View>
            </View>

            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor: theme.accent,
                backgroundColor: isSelected ? theme.accent : 'transparent',
              }}
            />
          </TouchableOpacity>
        );
      })}

      <PrimaryButton
        label="Calcular mi objetivo"
        loading={isLoading}
        onPress={handleContinue}
        style={{ marginTop: Spacing.six }}
      />
    </ThemedView>
  );
}