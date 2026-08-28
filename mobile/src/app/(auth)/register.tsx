import { useState } from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export default function RegisterScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
   router.push('/onboarding/profile-setup');
  };

  return (
    <ThemedView style={{ flex: 1, padding: Spacing.four }}>
      <ThemedText type="title">Crea tu cuenta</ThemedText>

      <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.four }}>Correo electrónico</ThemedText>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Ingresa tu correo electrónico"
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        style={{ borderWidth: 1, borderColor: theme.border, borderRadius: Spacing.three, padding: Spacing.three, color: theme.text, marginTop: Spacing.one }}
      />

      <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.three }}>Contraseña</ThemedText>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Ingresa tu contraseña"
        placeholderTextColor={theme.textSecondary}
        secureTextEntry
        style={{ borderWidth: 1, borderColor: theme.border, borderRadius: Spacing.three, padding: Spacing.three, color: theme.text, marginTop: Spacing.one }}
      />

      <TouchableOpacity onPress={handleRegister} style={{ backgroundColor: theme.accent, padding: Spacing.four, borderRadius: Spacing.three, marginTop: Spacing.four }}>
        <ThemedText style={{ textAlign: 'center', fontWeight: '700', color: '#000' }}>Registrarse</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}