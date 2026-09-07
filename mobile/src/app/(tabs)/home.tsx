import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import { Camera, Barcode, Search } from 'lucide-react-native';

import { api } from '@/api';
import { DailySummary } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { OutlineButton } from '@/components/ui/OutlineButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';


export default function HomeScreen() {
  const theme = useTheme();

  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSummary = async () => {
    setErrorMessage(null);

    try {
      const result = await api.getDailySummary();
      setSummary(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No fue posible cargar el resumen.',
      );
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  if (!summary && !errorMessage) {
    return <ActivityIndicator style={{ flex: 1 }} color={theme.accent} />;
  }

  if (!summary) {
    return (
      <ThemedView style={{ flex: 1, padding: Spacing.four, justifyContent: 'center' }}>
        <ThemedText style={{ color: '#ef4444', textAlign: 'center' }}>
          {errorMessage}
        </ThemedText>

        <PrimaryButton
          label="Intentar nuevamente"
          onPress={loadSummary}
          style={{ marginTop: Spacing.four }}
        />
      </ThemedView>
    );
  }

  const macros = [
    { label: 'Proteínas', consumed: summary.consumedMacros.protein, goal: summary.goal.protein },
    { label: 'Carbohidratos', consumed: summary.consumedMacros.carbs, goal: summary.goal.carbs },
    { label: 'Grasas', consumed: summary.consumedMacros.fat, goal: summary.goal.fat },
  ];

  return (
    <ThemedView style={{ flex: 1, padding: Spacing.four }}>
      <ThemedText type="title">Buenos días</ThemedText>

      <ThemedText themeColor="accent" type="small" style={{ marginTop: Spacing.one }}>
        Tu progreso de hoy
      </ThemedText>

      <Card style={{ marginTop: Spacing.four }}>
        <ThemedText>Resumen diario</ThemedText>

        <ThemedText type="title" style={{ marginTop: Spacing.one }}>
          {summary.consumedCalories} / {summary.goal.calories} kcal
        </ThemedText>

        <View style={{ marginTop: Spacing.two }}>
          <ProgressBar value={summary.consumedCalories} max={summary.goal.calories} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.three }}>
          {macros.map((macro) => (
            <View key={macro.label}>
              <ThemedText themeColor="accent" type="small">{macro.label}</ThemedText>
              <ThemedText type="small">{macro.consumed} / {macro.goal} g</ThemedText>
            </View>
          ))}
        </View>
      </Card>

      <ThemedText type="smallBold" style={{ marginTop: Spacing.four }}>
        Registrar comida
      </ThemedText>

      <PrimaryButton
        label="Fotografiar comida"
        icon={<Camera color="#000" size={18} />}
        onPress={() => router.push('/camera')}
        style={{ marginTop: Spacing.two }}
      />

      <View style={{ flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two }}>
        <OutlineButton
          label="Código de barras"
          icon={<Barcode color={theme.text} size={18} />}
          onPress={() => router.push('/barcode-scan')}
          style={{ flex: 1 }}
        />

        <OutlineButton
          label="Búsqueda manual"
          icon={<Search color={theme.text} size={18} />}
          onPress={() => router.push('/manual-search')}
          style={{ flex: 1 }}
        />
      </View>
    </ThemedView>
  );
}