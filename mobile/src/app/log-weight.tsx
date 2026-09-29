import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { api } from '@/api';
import { toLocalDateKey } from '@/api/weightDate';
import { AppScreen } from '@/components/app-screen';
import { BrandMark } from '@/components/brand-mark';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function LogWeightScreen() {
  const theme = useTheme();

  const [weight, setWeight] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const parsedWeight = Number(weight.replace(',', '.'));
  const isValid = Number.isFinite(parsedWeight) && parsedWeight >= 20 && parsedWeight <= 400;

  const handleSave = async () => {
    if (!isValid) return;

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await api.saveWeightEntry(toLocalDateKey(), parsedWeight);
      router.replace('/(tabs)/progress');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible guardar el peso.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppScreen scroll>
      <BrandMark centered compact />

      <ThemedText type="title" style={{ marginTop: Spacing.three }}>Registrar peso</ThemedText>
      <ThemedText themeColor="textSecondary" type="small" style={{ marginTop: Spacing.one }}>
        Ingresa tu peso de hoy para sumarlo a tu evolución.
      </ThemedText>

      <Card style={{ marginTop: Spacing.four, flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
        <TextInput
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          placeholder="Ej: 75.5"
          placeholderTextColor={theme.textSecondary}
          autoFocus
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
        <ThemedText themeColor="textSecondary">kg</ThemedText>
      </Card>

      {errorMessage && (
        <ThemedText style={{ color: '#ef4444', marginTop: Spacing.two }}>
          {errorMessage}
        </ThemedText>
      )}

      <PrimaryButton
        label="Guardar peso"
        disabled={!isValid}
        loading={isSaving}
        onPress={handleSave}
        style={{ marginTop: Spacing.four }}
      />
    </AppScreen>
  );
}
