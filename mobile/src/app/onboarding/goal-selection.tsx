import { useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowDown, Equal, ArrowUp, LucideIcon } from 'lucide-react-native';

import { api } from '@/api';
import { AppScreen } from '@/components/app-screen';
import { BrandMark } from '@/components/brand-mark';
import { GoalType } from '@/api/types';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ThemedText } from '@/components/themed-text';
import { AppPalette, Spacing } from '@/constants/theme';
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
    <AppScreen scroll>
      <BrandMark centered compact />

      <ThemedText type="small" themeColor="accent" style={{ marginTop: Spacing.four, textAlign: 'center' }}>
        Paso 2 de 2
      </ThemedText>

      <View style={{ height: 7, borderRadius: 4, backgroundColor: theme.border, marginTop: Spacing.two, overflow: 'hidden' }}>
        <View style={{ width: '100%', height: '100%', backgroundColor: theme.accent }} />
      </View>

      <ThemedText type="subtitle" style={{ marginTop: Spacing.five, textAlign: 'center' }}>
        ¿Cuál es tu objetivo?
      </ThemedText>

      <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.two, marginBottom: Spacing.two, textAlign: 'center' }}>
        Selecciona lo que quieres conseguir para calcular tu objetivo nutricional inicial.
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
              backgroundColor: isSelected
                ? AppPalette.surfaceStrong
                : AppPalette.surface,
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
        style={{ marginTop: Spacing.five }}
      />
    </AppScreen>
  );
}
