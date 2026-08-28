import { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { api } from '@/api';
import { DailySummary } from '@/api/types';

export default function HomeScreen() {
  const theme = useTheme();
  const [summary, setSummary] = useState<DailySummary | null>(null);

  useEffect(() => {
    api.getDailySummary().then(setSummary);
  }, []);

  if (!summary) {
    return <ActivityIndicator style={{ flex: 1 }} color={theme.accent} />;
  }

  return (
    <ThemedView style={{ flex: 1, padding: Spacing.four }}>
      <ThemedText type="title">Buenos días, Anthon</ThemedText>
      <ThemedText themeColor="accent" type="small" style={{ marginTop: Spacing.one }}>
        Tu progreso de hoy
      </ThemedText>

      <ThemedView type="backgroundElement" style={{ borderRadius: Spacing.four, padding: Spacing.four, marginTop: Spacing.four }}>
        <ThemedText>Resumen diario</ThemedText>
        <ThemedText type="title" style={{ marginTop: Spacing.one }}>
          {summary.consumedCalories} / {summary.goal.calories} kcal
        </ThemedText>
      </ThemedView>

      <TouchableOpacity
        onPress={() => router.push('/camera')}
        style={{ backgroundColor: theme.accent, padding: Spacing.four, borderRadius: Spacing.three, marginTop: Spacing.four }}
      >
        <ThemedText style={{ textAlign: 'center', fontWeight: '700', color: '#000' }}>📷 Fotografiar comida</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
