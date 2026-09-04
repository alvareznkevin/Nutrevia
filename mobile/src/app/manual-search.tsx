import { TextInput } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export default function ManualSearchScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={{ flex: 1, padding: Spacing.four }}>
      <ThemedText type="title">Búsqueda manual</ThemedText>
      <ThemedText themeColor="textSecondary" type="small" style={{ marginTop: Spacing.two }}>
        Busca un alimento por nombre para agregarlo a tu diario.
      </ThemedText>

      <TextInput
        placeholder="Ej: pechuga de pollo, arroz, palta..."
        placeholderTextColor={theme.textSecondary}
        style={{ borderWidth: 1, borderColor: theme.border, borderRadius: Spacing.three, padding: Spacing.three, color: theme.text, marginTop: Spacing.four }}
      />

      {/* TODO: conectar con el endpoint de búsqueda de alimentos del backend cuando exista */}
    </ThemedView>
  );
}