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
import { UserProfile, WeightEntry } from '@/api/types';
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
import { WeightChart } from '@/components/ui/WeightChart';

export default function ProgressScreen() {
  const theme = useTheme();
  const [mockHistory, setMockHistory] = useState<WeightEntry[] | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [localEntries, setLocalEntries] = useState(() => getLocalWeightEntries());
  const [latestWellbeing, setLatestWellbeing] = useState<WellbeingEntry | null>(() => getMostRecentWellbeingEntry());

  useEffect(() => {
    api.getWeightHistory().then(setMockHistory);
    api.getUserProfile().then(setProfile);
  }, []);

  useEffect(() => {
    return subscribeToLocalWeightEntries(() => setLocalEntries(getLocalWeightEntries()));
  }, []);

  useEffect(() => {
    return subscribeToLocalWellbeingEntries(() => setLatestWellbeing(getMostRecentWellbeingEntry()));
  }, []);

  if (!mockHistory || !profile) {
    return (
      <AppScreen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={theme.accent} />
        </View>
      </AppScreen>
    );
  }

  // Combina el historial de ejemplo con lo registrado localmente, ordenado
  // cronológicamente con el mismo formato de fecha ("día mes-abreviado").
  const combinedHistory = [...mockHistory, ...localEntries].sort(
    (a, b) => weightDateSortValue(a.date) - weightDateSortValue(b.date),
  );

  const currentWeight = combinedHistory[combinedHistory.length - 1]?.weightKg ?? profile.currentWeightKg;
  const firstWeight = combinedHistory[0]?.weightKg ?? currentWeight;
  const totalChange = (currentWeight - firstWeight).toFixed(1);
  const recentEntries = [...combinedHistory].reverse().slice(0, 5);

  const isLocalEntry = (date: string) => localEntries.some((entry) => entry.date === date);

  return (
    <AppScreen scroll>
      <BrandMark compact />

      <ThemedText type="subtitle" style={{ marginTop: Spacing.four }}>Seguimiento del peso</ThemedText>
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
        label="⚖️ Registrar peso"
        onPress={() => router.push('/log-weight')}
        style={{ marginTop: Spacing.five }}
      />

      <OutlineButton
        label="📝 Registrar bienestar"
        tone="accent"
        onPress={() => router.push('/log-wellbeing')}
        style={{ marginTop: Spacing.two }}
      />
      
      <OutlineButton
        label="📷 Registrar comida"
        tone="accent"
        onPress={() => router.push('/camera')}
        style={{ marginTop: Spacing.two }}
      />
    </AppScreen>
  );
}