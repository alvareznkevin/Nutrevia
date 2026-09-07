import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { OutlineButton } from '@/components/ui/OutlineButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
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

      <Card style={{ marginTop: Spacing.four }}>
        <ThemedText type="smallBold">Cambio de peso</ThemedText>
        <ThemedText themeColor="accent" type="title" style={{ fontSize: 28, marginTop: Spacing.one }}>
          {change} kg
        </ThemedText>
      </Card>

      {/* El gráfico de barras + línea de la imagen 11 queda pendiente:
          requiere una librería de gráficos (ej. victory-native) */}

      <PrimaryButton
        label="📷 Registrar comida"
        onPress={() => router.push('/camera')}
        style={{ marginTop: Spacing.four }}
      />

      <OutlineButton
        label="⚖️ Registrar peso"
        tone="accent"
        style={{ marginTop: Spacing.two }}
      />
    </ScrollView>
  );
}