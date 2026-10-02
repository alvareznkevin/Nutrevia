import { useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { addLocalWellbeingEntry } from '@/api/localWellbeingStore';
import { AppScreen } from '@/components/app-screen';
import { BrandMark } from '@/components/brand-mark';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const LEVEL_OPTIONS = [1, 2, 3, 4, 5];

function LevelSelector({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (level: number | null) => void;
}) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two }}>
      {LEVEL_OPTIONS.map((level) => {
        const isSelected = value === level;

        return (
          <TouchableOpacity
            key={level}
            onPress={() => onChange(isSelected ? null : level)}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: isSelected ? theme.accent : theme.border,
              backgroundColor: isSelected ? theme.accent : 'transparent',
              borderRadius: Spacing.two,
              paddingVertical: Spacing.three,
              alignItems: 'center',
            }}
          >
            <ThemedText type="smallBold" style={{ color: isSelected ? '#000' : theme.text }}>
              {level}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function LogWellbeingScreen() {
  const theme = useTheme();

  const [sleepHours, setSleepHours] = useState('');
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [fatigueLevel, setFatigueLevel] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const parsedSleepHours = sleepHours.trim() ? Number(sleepHours.replace(',', '.')) : null;
  const hasValidSleep = parsedSleepHours !== null && Number.isFinite(parsedSleepHours) && parsedSleepHours >= 0;
  const hasAnyValue = hasValidSleep || stressLevel !== null || fatigueLevel !== null;

  const handleSave = () => {
    if (!hasAnyValue) return;

    setIsSaving(true);

    addLocalWellbeingEntry({
      sleepHours: hasValidSleep ? parsedSleepHours! : undefined,
      stressLevel: stressLevel ?? undefined,
      fatigueLevel: fatigueLevel ?? undefined,
    });

    router.replace('/(tabs)/progress');
  };

  return (
    <AppScreen scroll keyboardShouldPersistTaps="handled">
      <BrandMark centered compact />

      <ThemedText type="title" style={{ marginTop: Spacing.three }}>Bienestar de hoy</ThemedText>
      <ThemedText themeColor="textSecondary" type="small" style={{ marginTop: Spacing.one }}>
        Todos los campos son opcionales — completa los que quieras registrar.
      </ThemedText>

      <ThemedText type="smallBold" style={{ marginTop: Spacing.four }}>Horas de sueño</ThemedText>
      <Card style={{ marginTop: Spacing.two, flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
        <TextInput
          value={sleepHours}
          onChangeText={setSleepHours}
          keyboardType="decimal-pad"
          placeholder="Ej: 7.5"
          placeholderTextColor={theme.textSecondary}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: Spacing.two,
            paddingHorizontal: Spacing.three,
            paddingVertical: Spacing.two,
            color: theme.text,
          }}
        />
        <ThemedText themeColor="textSecondary">horas</ThemedText>
      </Card>

      <ThemedText type="smallBold" style={{ marginTop: Spacing.four }}>Nivel de estrés</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.one }}>
        1 = muy bajo, 5 = muy alto
      </ThemedText>
      <LevelSelector value={stressLevel} onChange={setStressLevel} />

      <ThemedText type="smallBold" style={{ marginTop: Spacing.four }}>Nivel de fatiga</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.one }}>
        1 = sin fatiga, 5 = muy fatigado
      </ThemedText>
      <LevelSelector value={fatigueLevel} onChange={setFatigueLevel} />

      <PrimaryButton
        label="Guardar registro"
        disabled={!hasAnyValue}
        loading={isSaving}
        onPress={handleSave}
        style={{ marginTop: Spacing.five }}
      />
    </AppScreen>
  );
}