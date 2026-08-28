import { View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

const mockResult = { calories: 2200, protein: 140, carbs: 270, fat: 65 };

export default function DailyGoalResultScreen() {
  const theme = useTheme();

  const finishOnboarding = () => {
  router.replace('/(tabs)');
  };

  return (
    <ThemedView style={{ flex: 1, padding: Spacing.four, alignItems: 'center' }}>
      <ThemedText themeColor="accent" style={{ fontSize: 32, marginTop: Spacing.four }}>✓</ThemedText>
      <ThemedText type="subtitle" style={{ marginTop: Spacing.three }}>Tu objetivo diario</ThemedText>
      <ThemedText themeColor="textSecondary" type="small" style={{ textAlign: 'center', marginTop: Spacing.one }}>
        Calculado según tu perfil, actividad y objetivo.
      </ThemedText>

      <ThemedView type="backgroundElement" style={{ borderRadius: Spacing.four, padding: Spacing.four, marginTop: Spacing.four, width: '100%', alignItems: 'center' }}>
        <ThemedText themeColor="accent" type="small">Calorías diarias</ThemedText>
        <ThemedText type="title">{mockResult.calories} kcal</ThemedText>
      </ThemedView>

      <View style={{ flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three, width: '100%' }}>
        {[
          { label: 'Proteínas', value: mockResult.protein },
          { label: 'Carbohidratos', value: mockResult.carbs },
          { label: 'Grasas', value: mockResult.fat },
        ].map((m) => (
          <ThemedView key={m.label} type="backgroundElement" style={{ flex: 1, borderRadius: Spacing.three, padding: Spacing.two, alignItems: 'center' }}>
            <ThemedText type="small" themeColor="textSecondary">{m.label}</ThemedText>
            <ThemedText type="smallBold">{m.value} g</ThemedText>
          </ThemedView>
        ))}
      </View>

      <TouchableOpacity onPress={finishOnboarding} style={{ backgroundColor: theme.accent, padding: Spacing.four, borderRadius: Spacing.three, marginTop: Spacing.six, width: '100%' }}>
        <ThemedText style={{ textAlign: 'center', fontWeight: '700', color: '#000' }}>Confirmar objetivo</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}