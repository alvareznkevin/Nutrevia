import { useState } from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export default function ProfileSetupScreen() {
  const theme = useTheme();
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const handleContinue = () => {
    // TODO: guardar age/height/weight en un context o store global
    router.push('/onboarding/goal-selection');
  };

  return (
    <ThemedView style={{ flex: 1, padding: Spacing.four }}>
      <ThemedText type="small" themeColor="accent">Paso 1 de 2</ThemedText>
      <ThemedText type="subtitle" style={{ marginTop: Spacing.two }}>Cuéntanos sobre ti</ThemedText>

      <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.four }}>Edad</ThemedText>
      <TextInput
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
        placeholder="Ingresa tu edad"
        placeholderTextColor={theme.textSecondary}
        style={{ borderWidth: 1, borderColor: theme.border, borderRadius: Spacing.three, padding: Spacing.three, color: theme.text, marginTop: Spacing.one }}
      />

      <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.three }}>Altura (cm)</ThemedText>
      <TextInput
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
        placeholder="Ingresa tu altura"
        placeholderTextColor={theme.textSecondary}
        style={{ borderWidth: 1, borderColor: theme.border, borderRadius: Spacing.three, padding: Spacing.three, color: theme.text, marginTop: Spacing.one }}
      />

      <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.three }}>Peso actual (kg)</ThemedText>
      <TextInput
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
        placeholder="Ingresa tu peso"
        placeholderTextColor={theme.textSecondary}
        style={{ borderWidth: 1, borderColor: theme.border, borderRadius: Spacing.three, padding: Spacing.three, color: theme.text, marginTop: Spacing.one }}
      />

      {/* Selector de actividad física: agregar @react-native-picker/picker cuando lo instales */}

      <TouchableOpacity onPress={handleContinue} style={{ backgroundColor: theme.accent, padding: Spacing.four, borderRadius: Spacing.three, marginTop: Spacing.six }}>
        <ThemedText style={{ textAlign: 'center', fontWeight: '700', color: '#000' }}>Continuar</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}