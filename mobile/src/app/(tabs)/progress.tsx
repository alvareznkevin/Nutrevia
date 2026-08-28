import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { api } from '@/api';
import { WeightEntry } from '@/api/types';

export default function ProgressScreen() {
  const theme = useTheme();
  const [history, setHistory] = useState<WeightEntry[] | null>(null);

  useEffect(() => {
    api.getWeightHistory().then(setHistory);
  }, []);

  if (!history) {
    return <ActivityIndicator style={{ flex: 1 }} color={theme.accent} />;
  }

  const change = (history[history.length - 1].weightKg - history[0].weightKg).toFixed(1);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: Spacing.four }}>
      <ThemedText type="title">Tu semana</ThemedText>
      <ThemedText themeColor="accent" type="small" style={{ marginTop: Spacing.one }}>
        Tu historial empieza a mostrar una visión más completa.
      </ThemedText>

      <ThemedView type="backgroundElement" style={{ borderRadius: Spacing.four, padding: Spacing.four, marginTop: Spacing.four }}>
        <ThemedText type="smallBold">Cambio de peso</ThemedText>
        <ThemedText themeColor="accent" type="title" style={{ fontSize: 28, marginTop: Spacing.one }}>{change} kg</ThemedText>
      </ThemedView>

      {/* El gráfico de barras + línea de la imagen 11 queda pendiente:
          requiere una librería de gráficos (ej. victory-native) */}

      <TouchableOpacity
        style={{ backgroundColor: theme.accent, padding: Spacing.four, borderRadius: Spacing.three, marginTop: Spacing.four }}
        onPress={() => router.push('/camera')}
      >
        <ThemedText style={{ textAlign: 'center', fontWeight: '700', color: '#000' }}>📷 Registrar comida</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={{ borderWidth: 1, borderColor: theme.accent, padding: Spacing.four, borderRadius: Spacing.three, marginTop: Spacing.two }}>
        <ThemedText themeColor="accent" style={{ textAlign: 'center', fontWeight: '700' }}>⚖️ Registrar peso</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}