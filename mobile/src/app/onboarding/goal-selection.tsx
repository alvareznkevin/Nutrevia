import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

type Goal = 'lose' | 'maintain' | 'gain';

const options: { id: Goal; title: string; subtitle: string; icon: string }[] = [
  { id: 'lose', title: 'Perder peso', subtitle: 'Reducir el peso de forma gradual.', icon: '↓' },
  { id: 'maintain', title: 'Mantener peso', subtitle: 'Conservar tu peso actual.', icon: '=' },
  { id: 'gain', title: 'Aumentar peso', subtitle: 'Incrementar el peso de forma gradual.', icon: '↑' },
];

export default function GoalSelectionScreen() {
  const theme = useTheme();
  const [selected, setSelected] = useState<Goal>('maintain');

  const handleContinue = () => {
    router.push('/onboarding/daily-goal-result');
  };

  return (
    <ThemedView style={{ flex: 1, padding: Spacing.four }}>
      <ThemedText type="small" themeColor="accent">Paso 2 de 2</ThemedText>
      <ThemedText type="subtitle" style={{ marginTop: Spacing.two }}>¿Cuál es tu objetivo?</ThemedText>

      {options.map((opt) => (
        <TouchableOpacity
          key={opt.id}
          onPress={() => setSelected(opt.id)}
          style={{
            borderWidth: 1,
            borderColor: selected === opt.id ? theme.accent : theme.border,
            borderRadius: Spacing.three,
            padding: Spacing.four,
            marginTop: Spacing.three,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
            <ThemedText themeColor="accent" style={{ fontSize: 20 }}>{opt.icon}</ThemedText>
            <View>
              <ThemedText type="smallBold">{opt.title}</ThemedText>
              <ThemedText themeColor="textSecondary" type="small">{opt.subtitle}</ThemedText>
            </View>
          </View>
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              borderWidth: 2,
              borderColor: theme.accent,
              backgroundColor: selected === opt.id ? theme.accent : 'transparent',
            }}
          />
        </TouchableOpacity>
      ))}

      <TouchableOpacity onPress={handleContinue} style={{ backgroundColor: theme.accent, padding: Spacing.four, borderRadius: Spacing.three, marginTop: Spacing.six }}>
        <ThemedText style={{ textAlign: 'center', fontWeight: '700', color: '#000' }}>Calcular mi objetivo</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}