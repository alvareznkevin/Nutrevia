import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { api } from '@/api';
import { DailySummary } from '@/api/types';

export default function DiaryScreen() {
  const theme = useTheme();
  const [summary, setSummary] = useState<DailySummary | null>(null);

  useEffect(() => {
    api.getDailySummary().then(setSummary);
  }, []);

  if (!summary) {
    return <ActivityIndicator style={{ flex: 1 }} color={theme.accent} />;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: Spacing.four }}>
      <ThemedText type="title">Diario nutricional</ThemedText>

      <ThemedView type="backgroundElement" style={{ borderRadius: Spacing.four, padding: Spacing.four, marginTop: Spacing.four }}>
        <ThemedText>Resumen del día — {summary.date}</ThemedText>
        <ThemedText type="title" style={{ marginTop: Spacing.one }}>
          {summary.consumedCalories} / {summary.goal.calories} kcal
        </ThemedText>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.three }}>
          <View>
            <ThemedText themeColor="accent" type="small">Proteínas</ThemedText>
            <ThemedText type="small">{summary.consumedMacros.protein} / {summary.goal.protein} g</ThemedText>
          </View>
          <View>
            <ThemedText themeColor="accent" type="small">Carbohidratos</ThemedText>
            <ThemedText type="small">{summary.consumedMacros.carbs} / {summary.goal.carbs} g</ThemedText>
          </View>
          <View>
            <ThemedText themeColor="accent" type="small">Grasas</ThemedText>
            <ThemedText type="small">{summary.consumedMacros.fat} / {summary.goal.fat} g</ThemedText>
          </View>
        </View>
      </ThemedView>

      <ThemedText type="smallBold" style={{ marginTop: Spacing.four }}>Comidas registradas</ThemedText>

      {summary.meals.map((meal) => (
        <ThemedView
          key={meal.id}
          type="backgroundElement"
          style={{ borderRadius: Spacing.three, padding: Spacing.three, marginTop: Spacing.two, flexDirection: 'row', justifyContent: 'space-between' }}
        >
          <View>
            <ThemedText type="smallBold" style={{ textTransform: 'capitalize' }}>{meal.type}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">{meal.time} · {meal.description}</ThemedText>
          </View>
          <ThemedText type="smallBold">{meal.calories} kcal</ThemedText>
        </ThemedView>
      ))}

      <TouchableOpacity style={{ backgroundColor: theme.accent, padding: Spacing.four, borderRadius: Spacing.three, marginTop: Spacing.four }}>
        <ThemedText style={{ textAlign: 'center', fontWeight: '700', color: '#000' }}>+ Registrar otra comida</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}