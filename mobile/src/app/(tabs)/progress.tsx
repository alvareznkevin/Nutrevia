import { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Trash2 } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { AppScreen } from '@/components/app-screen';
import { BrandMark } from '@/components/brand-mark';
import { OutlineButton } from '@/components/ui/OutlineButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { api } from '@/api';
import { DailySummary, UserProfile, WeightEntry } from '@/api/types';
import {
  getLocalWeightEntries,
  removeLocalWeightEntry,
  subscribeToLocalWeightEntries,
  weightDateSortValue,
} from '@/api/localWeightStore';
import {
  getMostRecentWellbeingEntry,
  subscribeToLocalWellbeingEntries,
  WellbeingEntry,
} from '@/api/localWellbeingStore';
import { subscribeToLocalMeals } from '@/api/localDiaryStore';
import { getWeeklyStats } from '@/api/weeklySummary';
import { WeightChart } from '@/components/ui/WeightChart';
import { WeeklyBarChart } from '@/components/ui/WeeklyBarChart';

function getAnalysisMessage(weightChange: number | null, daysWithRegistry: number) {
  const confidence = daysWithRegistry >= 5 ? 'alta' : daysWithRegistry >= 3 ? 'media' : 'baja';

  if (weightChange === null) {
    return {
      message: 'Registra tu peso en más de un día de esta semana para ver un análisis de tendencia.',
      confidence: 'baja' as const,
    };
  }

  if (weightChange < 0) {
    return { message: 'Vas en una dirección estable: tu peso muestra una leve baja esta semana.', confidence };
  }

  if (weightChange > 0) {
    return { message: 'Tu peso subió levemente esta semana — revisa tu registro si no era tu objetivo.', confidence };
  }

  return { message: 'Tu peso se mantuvo estable esta semana.', confidence };
}

export default function ProgressScreen() {
  const theme = useTheme();
  const [mockHistory, setMockHistory] = useState<WeightEntry[] | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [localEntries, setLocalEntries] = useState(() => getLocalWeightEntries());
  const [latestWellbeing, setLatestWellbeing] = useState<WellbeingEntry | null>(() => getMostRecentWellbeingEntry());
  const [weeklyStats, setWeeklyStats] = useState(() => getWeeklyStats());

  useEffect(() => {
    api.getWeightHistory().then(setMockHistory);
    api.getUserProfile().then(setProfile);
    api.getDailySummary().then(setDailySummary);
  }, []);

  useEffect(() => {
    return subscribeToLocalWeightEntries(() => {
      setLocalEntries(getLocalWeightEntries());
      setWeeklyStats(getWeeklyStats());
    });
  }, []);

  useEffect(() => {
    return subscribeToLocalWellbeingEntries(() => setLatestWellbeing(getMostRecentWellbeingEntry()));
  }, []);

  useEffect(() => {
    return subscribeToLocalMeals(() => setWeeklyStats(getWeeklyStats()));
  }, []);

  if (!mockHistory || !profile || !dailySummary) {
    return (
      <AppScreen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={theme.accent} />
        </View>
      </AppScreen>
    );
  }

  const combinedHistory = [...mockHistory, ...localEntries].sort(
    (a, b) => weightDateSortValue(a.date) - weightDateSortValue(b.date),
  );

  const currentWeight = combinedHistory[combinedHistory.length - 1]?.weightKg ?? profile.currentWeightKg;
  const firstWeight = combinedHistory[0]?.weightKg ?? currentWeight;
  const totalChange = (currentWeight - firstWeight).toFixed(1);
  const recentEntries = [...combinedHistory].reverse().slice(0, 5);

  const isLocalEntry = (date: string) => localEntries.some((entry) => entry.date === date);

  const analysis = getAnalysisMessage(weeklyStats.weightChange, weeklyStats.daysWithRegistry);

  return (
    <AppScreen scroll>
      <BrandMark compact />

      <ThemedText type="subtitle" style={{ marginTop: Spacing.four }}>Tu semana</ThemedText>
      <ThemedText themeColor="accent" type="small" style={{ marginTop: Spacing.one }}>
        {weeklyStats.daysWithRegistry > 0
          ? 'Tu historial empieza a mostrar una visión más completa.'
          : 'Registra algo esta semana para ver tu resumen.'}
      </ThemedText>

      <Card style={{ marginTop: Spacing.four }}>
        <ThemedText type="smallBold">Constancia de registro</ThemedText>
        <ThemedText themeColor="accent" type="small" style={{ marginTop: Spacing.one }}>
          {weeklyStats.daysWithRegistry} de 7 días
        </ThemedText>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.three }}>
          {weeklyStats.days.map((day, index) => (
            <View key={index} style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: day.hasRegistry ? theme.accent : 'transparent',
                  borderWidth: day.hasRegistry ? 0 : 1,
                  borderColor: theme.border,
                }}
              >
                <ThemedText type="small" style={{ color: day.hasRegistry ? '#000' : theme.textSecondary }}>
                  {day.shortLabel}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three }}>
        <Card style={{ flex: 1, alignItems: 'center' }}>
          <ThemedText type="small" themeColor="textSecondary">Promedio diario</ThemedText>
          <ThemedText type="smallBold" style={{ marginTop: Spacing.one }}>{weeklyStats.avgCalories} kcal</ThemedText>
        </Card>

        <Card style={{ flex: 1, alignItems: 'center' }}>
          <ThemedText type="small" themeColor="textSecondary">Proteína</ThemedText>
          <ThemedText type="smallBold" style={{ marginTop: Spacing.one }}>
            {weeklyStats.avgProtein} / {dailySummary.goal.protein} g
          </ThemedText>
        </Card>

        <Card style={{ flex: 1, alignItems: 'center' }}>
          <ThemedText type="small" themeColor="textSecondary">Cambio de peso</ThemedText>
          <ThemedText type="smallBold" style={{ marginTop: Spacing.one }}>
            {weeklyStats.weightChange !== null ? `${weeklyStats.weightChange} kg` : '—'}
          </ThemedText>
        </Card>
      </View>

      <Card style={{ marginTop: Spacing.three }}>
        <ThemedText type="smallBold">Alimentación y peso</ThemedText>
        <View style={{ marginTop: Spacing.three }}>
          <WeeklyBarChart
            values={weeklyStats.days.map((day) => day.calories)}
            labels={weeklyStats.days.map((day) => day.shortLabel)}
            goal={dailySummary.goal.calories}
          />
        </View>
      </Card>

      <Card
        style={{
          marginTop: Spacing.three,
          backgroundColor: theme.backgroundElement,
          borderWidth: 1,
          borderColor: theme.accent,
        }}
      >
        <ThemedText type="smallBold" themeColor="accent">Análisis automático</ThemedText>
        <ThemedText type="small" style={{ marginTop: Spacing.one }}>{analysis.message}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.one }}>
          Confianza {analysis.confidence}
        </ThemedText>
      </Card>

      <ThemedText type="subtitle" style={{ marginTop: Spacing.six }}>Seguimiento del peso</ThemedText>
      <ThemedText themeColor="accent" type="small" style={{ marginTop: Spacing.one }}>
        Observa tu evolución a lo largo del tiempo.
      </ThemedText>

      <View style={{ flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.four }}>
        <Card style={{ flex: 1, alignItems: 'center' }}>
          <ThemedText type="small" themeColor="textSecondary">Peso actual</ThemedText>
          <ThemedText type="smallBold" style={{ marginTop: Spacing.one }}>{currentWeight} kg</ThemedText>
        </Card>

        <Card style={{ flex: 1, alignItems: 'center' }}>
          <ThemedText type="small" themeColor="textSecondary">Cambio total</ThemedText>
          <ThemedText
            type="smallBold"
            style={{ marginTop: Spacing.one, color: Number(totalChange) <= 0 ? theme.accent : theme.text }}
          >
            {Number(totalChange) > 0 ? '+' : ''}{totalChange} kg
          </ThemedText>
        </Card>

        <Card style={{ flex: 1, alignItems: 'center' }}>
          <ThemedText type="small" themeColor="textSecondary">Objetivo</ThemedText>
          <ThemedText type="smallBold" style={{ marginTop: Spacing.one }}>{profile.goalWeightKg} kg</ThemedText>
        </Card>
      </View>

      <Card style={{ marginTop: Spacing.four }}>
        <ThemedText type="smallBold">Evolución</ThemedText>
        <View style={{ marginTop: Spacing.three }}>
          <WeightChart entries={combinedHistory} />
        </View>
      </Card>

      <ThemedText type="smallBold" style={{ marginTop: Spacing.four }}>Registros recientes</ThemedText>

      {recentEntries.map((entry) => (
        <Card
          key={entry.date}
          style={{ marginTop: Spacing.two, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <View>
            <ThemedText type="small" themeColor="textSecondary" style={{ textTransform: 'capitalize' }}>
              {entry.date}
            </ThemedText>
            <ThemedText type="smallBold">{entry.weightKg} kg</ThemedText>
          </View>

          {isLocalEntry(entry.date) && (
            <TouchableOpacity onPress={() => removeLocalWeightEntry(entry.date)} hitSlop={8}>
              <Trash2 color="#ef4444" size={18} />
            </TouchableOpacity>
          )}
        </Card>
      ))}

      {latestWellbeing && (
        <>
          <ThemedText type="smallBold" style={{ marginTop: Spacing.four }}>Bienestar</ThemedText>

          <Card style={{ marginTop: Spacing.two }}>
            <ThemedText type="small" themeColor="textSecondary">
              Último registro — {latestWellbeing.date}
            </ThemedText>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.two }}>
              <View>
                <ThemedText type="small" themeColor="textSecondary">Sueño</ThemedText>
                <ThemedText type="smallBold">
                  {latestWellbeing.sleepHours !== undefined ? `${latestWellbeing.sleepHours} h` : '—'}
                </ThemedText>
              </View>
              <View>
                <ThemedText type="small" themeColor="textSecondary">Estrés</ThemedText>
                <ThemedText type="smallBold">
                  {latestWellbeing.stressLevel !== undefined ? `${latestWellbeing.stressLevel}/5` : '—'}
                </ThemedText>
              </View>
              <View>
                <ThemedText type="small" themeColor="textSecondary">Fatiga</ThemedText>
                <ThemedText type="smallBold">
                  {latestWellbeing.fatigueLevel !== undefined ? `${latestWellbeing.fatigueLevel}/5` : '—'}
                </ThemedText>
              </View>
            </View>
          </Card>
        </>
      )}

      <PrimaryButton
        label="📷 Registrar comida"
        onPress={() => router.push('/camera')}
        style={{ marginTop: Spacing.five }}
      />

      <OutlineButton
        label="⚖️ Registrar peso"
        tone="accent"
        onPress={() => router.push('/log-weight')}
        style={{ marginTop: Spacing.two }}
      />

      <OutlineButton
        label="📝 Registrar bienestar"
        tone="accent"
        onPress={() => router.push('/log-wellbeing')}
        style={{ marginTop: Spacing.two }}
      />
    </AppScreen>
  );
}